import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/blogs");
      setBlogs(res.data);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="container py-5">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="fw-bold text-primary">Welcome to MyBlog 📰</h1>
        <p className="lead text-muted">
          Discover, read, and share amazing stories with the world.
        </p>
      </div>

      {/* Latest Blogs */}
      <h2 className="text-center mb-4">Latest Blogs</h2>
      {loading ? (
        <p className="text-center text-muted">Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p className="text-center text-muted">No blogs available yet.</p>
      ) : (
        <div className="row">
          {blogs.map((blog) => (
            <div className="col-md-4 mb-4" key={blog._id}>
              <div className="card shadow-sm h-100 border-0 rounded-3">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold text-dark">{blog.title}</h5>
                  <p className="card-text text-muted flex-grow-1">
                    {blog.content.length > 120
                      ? blog.content.substring(0, 120) + "..."
                      : blog.content}
                  </p>
                  <Link
                    to={`/blogs/${blog._id}`}
                    className="btn btn-outline-primary mt-auto"
                  >
                    Read More
                  </Link>
                </div>
                <div className="card-footer text-muted small">
                  ✍️ By {blog.author?.username || "Anonymous"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;