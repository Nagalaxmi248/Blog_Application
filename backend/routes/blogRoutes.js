import express from "express";
import Blog from "../models/Blog.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Blog
router.post("/create", protect, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const newBlog = await Blog.create({
      title,
      content,
      author: req.user._id,  // 👈 store logged-in user as author
    });

    res.status(201).json(newBlog);
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "username email");
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get blogs of logged-in user
router.get("/myblogs", protect, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id }).populate("author", "username email");
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET blog by ID
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// @route POST /api/blogs
router.post("/", protect, async (req, res) => {
  try {
    const blog = new Blog({
      title: req.body.title,
      content: req.body.content,
      user: req.user._id
    });
    const createdBlog = await blog.save();
    res.status(201).json(createdBlog);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route PUT /api/blogs/:id
// Update Blog
router.put("/:id", protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (!blog.author) {
      return res.status(400).json({ message: "Blog has no author assigned" });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to edit this blog" });
    }

    blog.title = req.body.title || blog.title;
    blog.content = req.body.content || blog.content;

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (err) {
    console.error("Error updating blog:", err); // 👈 log the actual error
    res.status(500).json({ message: err.message || "Server error" });
  }
});



// @route DELETE /api/blogs/:id
// Delete Blog
router.delete("/:id", protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // ✅ Check if logged-in user is the blog's author
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to delete this blog" });
    }

    await blog.deleteOne();
    res.json({ message: "Blog removed" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


export default router;