// Blog_App/backend/routes/blogRoutes.js
import express from "express";
import { body, validationResult } from "express-validator";
import Blog from "../models/Blog.js";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import { isAuthorOrAdmin } from "../utils/permissions.js";


const router = express.Router();

/**
 * GET /api/blogs
 * Query: page, limit, q (search)
 */
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const q = req.query.q ? String(req.query.q).trim() : "";

    const filter = q
      ? {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { content: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const total = await Blog.countDocuments(filter);
    const data = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "username email role");

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (err) {
    console.error("List blogs error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/blogs/all
 * Admin-only: returns all blogs
 */
router.get("/all", protect, admin, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).populate("author", "username email role");
    return res.json(blogs);
  } catch (err) {
    console.error("Admin get all blogs error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/blogs/create
 * Create a blog (protected)
 */
router.post(
  "/create",
  protect,
  [
    body("title").isString().isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),
    body("content").isString().isLength({ min: 10 }).withMessage("Content must be at least 10 characters"),
  ],
  async (req, res) => {
    // Log incoming body for debugging
    console.log("Incoming create blog request body:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      if (!req.user) return res.status(401).json({ message: "Not authorized" });

      const { title, content, image } = req.body;

      const newBlog = await Blog.create({
        title,
        content,
        image: image || null,
        author: req.user._id,
      });

      console.log(`Blog created: ${newBlog._id} by ${req.user.email || req.user._id}`);
      return res.status(201).json(newBlog);
    } catch (err) {
      console.error("Create blog error:", err);
      return res.status(500).json({ message: "Server error creating blog", detail: err.message });
    }
  }
);

/**
 * GET /api/blogs/:id
 * Get single blog
 */
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).json({ message: "Invalid blog id" });

    const blog = await Blog.findById(id).populate("author", "username email role");
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    return res.json(blog);
  } catch (err) {
    console.error("Get blog error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* PUT /api/blogs/:id */
router.put("/:id", protect, [
  body("title").optional().isString().isLength({ min: 3 }),
  body("content").optional().isString().isLength({ min: 10 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const id = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).json({ message: "Invalid id" });

  const blog = await Blog.findById(id);
  if (!blog) return res.status(404).json({ message: "Blog not found" });

  if (!isAuthorOrAdmin(req.user, blog.author)) {
    return res.status(403).json({ message: "Forbidden — not author or admin" });
  }

  const { title, content, image } = req.body;
  if (title) blog.title = title;
  if (content) blog.content = content;
  if (image !== undefined) blog.image = image;

  await blog.save();
  return res.json(blog);
});


/* DELETE /api/blogs/:id */
router.delete("/:id", protect, async (req, res) => {
  const id = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).json({ message: "Invalid id" });

  const blog = await Blog.findById(id);
  if (!blog) return res.status(404).json({ message: "Blog not found" });

  if (!isAuthorOrAdmin(req.user, blog.author)) {
    return res.status(403).json({ message: "Forbidden — not author or admin" });
  }

  await blog.deleteOne();
  return res.json({ message: "Blog removed" });
});

export default router;