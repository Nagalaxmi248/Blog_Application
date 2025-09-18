// backend/routes/adminRoutes.js
import express from "express";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import User from "../models/User.js";
import AdminAction from "../models/AdminAction.js"; // for audit logging (optional)

const router = express.Router();

// GET /api/admin/users  -> list users (admin only)
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Admin list users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/admin/users/:id/role  -> change a user's role
router.put("/users/:id/role", protect, admin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !["user", "moderator", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const prevRole = user.role;
    user.role = role;
    await user.save();

    // audit log (optional)
    try {
      if (AdminAction) {
        await AdminAction.create({
          actor: req.user._id,
          action: "change_role",
          target: user._id,
          details: { from: prevRole, to: role },
        });
      }
    } catch (e) {
      console.warn("AdminAction logging failed", e);
    }

    res.json({ message: "Role updated", user: { _id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Change role error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/admin/users/:id  -> delete user (admin only)
router.delete("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent self-delete by admin
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    await user.deleteOne();

    // audit log (optional)
    try {
      if (AdminAction) {
        await AdminAction.create({
          actor: req.user._id,
          action: "delete_user",
          target: user._id,
          details: { email: user.email },
        });
      }
    } catch (e) {
      console.warn("AdminAction logging failed", e);
    }

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
