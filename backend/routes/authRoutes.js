// Blog_App/backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

import User from "../models/User.js";

const router = express.Router();

// Helper to sign JWT
function signToken(user) {
  const payload = {
    id: user._id,
    username: user.username,
    role: user.role,
  };
  const secret = process.env.JWT_SECRET || "changeme";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  [
    body("username").isString().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    try {
      // Check existing user
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) return res.status(400).json({ message: "User with this email already exists" });

      // IMPORTANT: do NOT pre-hash here because User model has a pre-save hook that hashes password.
      const user = await User.create({
        username,
        email: email.toLowerCase().trim(),
        password, // raw password -> model will hash it
      });

      const token = signToken(user);

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
      });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return token
 * @access  Public
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });

      // Use model method if available, otherwise bcrypt.compare
      const isMatch = typeof user.matchPassword === "function"
        ? await user.matchPassword(password)
        : await bcrypt.compare(password, user.password);

      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      const token = signToken(user);

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;