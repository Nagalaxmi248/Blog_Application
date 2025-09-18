// src/pages/BlogDetails.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { user, isAdmin, token } = useAuth?.() || { user: null, isAdmin: false, token: null };

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const fetchBlog = async () => {
      if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
        setError("Invalid blog id.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${API_BASE}/api/blogs/${id}`, { signal: controller.signal });
        setBlog(res.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Error fetching blog:", err);
        setError(err.response?.data?.message || "Failed to load blog.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
    return () => controller.abort();
  }, [id]);

  const authorId = blog && (blog.author?._id || blog.author?.id || blog.author);
  const isAuthor = Boolean(user && authorId && String(authorId) === String(user.id));
  const canModify = isAuthor || isAdmin;

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      if (!token) throw new Error("Not authenticated");
      await axios.delete(`${API_BASE}/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // navigate back to dashboard (or homepage) after delete
      navigate("/dashboard");
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || err.message || "Failed to delete blog");
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!blog) return <div className="alert alert-warning">Blog not found</div>;

  return (
    <div className="container py-4">
      <div className="mb-3">
        <button className="btn btn-sm btn-link" onClick={() => navigate(-1)}>← Read less</button>
      </div>

      <div className="card">
        {blog.image && <img src={blog.image} className="card-img-top" alt={blog.title} style={{ maxHeight: 420, objectFit: "cover" }} />}
        <div className="card-body">
          <h2 className="card-title">{blog.title}</h2>
          <p className="text-muted mb-2">By {blog.author?.username || blog.author?.email || "Unknown"}</p>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{blog.content}</div>

          <div className="mt-4 d-flex gap-2">
            {/* View button isn't necessary because we're already on details; but kept for parity */}
            <button className="btn btn-sm btn-outline-secondary" onClick={() => window.open(`/blogs/${id}`, "_blank")}>Open in new tab</button>

            {canModify && (
              <>
                <button className="btn btn-sm btn-primary" onClick={handleEdit}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={handleDelete}>Delete</button>
              </>
            )}

            <button className="btn btn-sm btn-secondary ms-auto" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
}
