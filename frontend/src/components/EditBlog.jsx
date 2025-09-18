// src/components/EditBlog.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import BlogForm from "./BlogForm";

function EditBlog() {
  const { id } = useParams();
  const [initial, setInitial] = useState({ title: "", content: "", image: null });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/blogs/${id}`);
        setInitial({ title: res.data.title || "", content: res.data.content || "", image: res.data.image || null });
      } catch (err) {
        console.error("Failed to load blog for edit:", err);
        setMessage(err.response?.data?.message || "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBlog();
  }, [id]);

  const handleUpdate = async (form) => {
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      if (!token) { setMessage("Login required"); return; }
      const payload = { title: form.title, content: form.content };
      if (form.image) payload.image = form.image;

      const res = await axios.put(`${API_BASE}/api/blogs/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Updated successfully");
      setTimeout(() => navigate(`/blogs/${res.data._id || id}`), 800);
    } catch (err) {
      console.error("Update error:", err);
      setMessage(err.response?.data?.message || "Failed to update");
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <div className="container py-4">
      <h2>Edit Blog</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <BlogForm onSubmit={handleUpdate} initialData={initial} buttonText="Update" />
    </div>
  );
}

export default EditBlog;
