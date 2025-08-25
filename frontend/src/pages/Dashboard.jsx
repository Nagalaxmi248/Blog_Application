import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/blogs/myblogs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(res.data);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to load blogs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(blogs.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete blog.");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading blogs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>My Blogs</h2>
        <Link to="/blogs/create" className="btn btn-primary">
          ➕ Create Blog
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {blogs.length === 0 ? (
        <p className="text-muted text-center">You haven’t written any blogs yet.</p>
      ) : (
        <div className="row">
          {blogs.map((blog) => (
            <div className="col-md-6 col-lg-4 mb-4" key={blog._id}>
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{blog.title}</h5>
                  <p className="card-text text-muted">
                    {blog.content.length > 120
                      ? blog.content.substring(0, 120) + "..."
                      : blog.content}
                  </p>
                  <div className="mt-auto">
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => navigate(`/blogs/edit/${blog._id}`)}
                    >
                      ✏ Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(blog._id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
                <div className="card-footer text-muted small">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
