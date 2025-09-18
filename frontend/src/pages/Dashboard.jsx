// src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BlogCard from "../components/BlogCard";
import useAuth from "../hooks/useAuth";

export default function Dashboard() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const navigate = useNavigate();
  const { token, user, isAdmin } = useAuth();

  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  // fetch ALL blogs (paginated) — admin will be able to edit/delete via permissions on backend
  const fetchPage = async (p = 1, q = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/api/blogs`, { params: { page: p, limit, q } });
      const payload = res.data || {};
      const pageData = Array.isArray(payload.data) ? payload.data : [];
      setBlogs(pageData);
      setPage(payload.page || p);
      setTotalPages(payload.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      setError(err.response?.data?.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // search debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPage(1, search.trim());
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const handleNew = () => navigate("/create");

  // optimistic delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;

    const prev = blogs;
    setBlogs((b) => b.filter((x) => x._id !== id));
    setMessage("");

    try {
      if (!token) throw new Error("Not authenticated");
      await axios.delete(`${API_BASE}/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      setError(err.response?.data?.message || err.message || "Failed to delete");
      setBlogs(prev); // rollback
    }
  };

  const handleEdit = (id) => navigate(`/edit/${id}`);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    fetchPage(p, search);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>All Blogs</h3>
        <div className="d-flex">
          <input
            className="form-control form-control-sm me-2"
            style={{ width: 260 }}
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-sm btn-success" onClick={handleNew}>New Post</button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">Loading...</div>
      ) : blogs.length === 0 ? (
        <div className="alert alert-info">No posts found.</div>
      ) : (
        <div className="row">
          {blogs.map((b) => (
            <div key={b._id} className="col-md-6 mb-3">
              <BlogCard blog={b} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mt-4">
        <div>
          <small className="text-muted">Page {page} of {totalPages}</small>
        </div>
        <div>
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => goToPage(page - 1)} disabled={page <= 1}>Prev</button>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>Next</button>
        </div>
      </div>
    </div>
  );
}
