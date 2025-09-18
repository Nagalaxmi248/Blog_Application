// src/components/CreateBlog.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BlogForm from "./BlogForm";

function CreateBlog() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [debug, setDebug] = useState(null);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // helper to check valid Mongo ObjectId
  const isValidObjectId = (id) =>
    typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

  const handleCreate = async (form) => {
    setLoading(true);
    setMessage("");
    setDebug(null);

    // simple frontend validation
    if (!form.title || form.title.trim().length < 3) {
      setMessage("Title must be at least 3 characters.");
      setLoading(false);
      return;
    }
    if (!form.content || form.content.trim().length < 10) {
      setMessage("Content must be at least 10 characters.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("You must be logged in.");
        setLoading(false);
        return;
      }

      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
      };
      if (form.image) payload.image = form.image;

      // ✅ POST request to backend
      const res = await axios.post(`${API_BASE}/api/blogs/create`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDebug({ status: res.status, data: res.data });

      const created = res.data;
      const id = created?._id || created?.id;

      if (isValidObjectId(id)) {
        setMessage("✅ Blog created! Redirecting...");
        setTimeout(() => navigate(`/blogs/${id}`), 800);
      } else {
        setMessage("Blog created, but server did not return a valid id.");
      }
    } catch (err) {
      console.error("Create blog error:", err);
      setDebug({
        status: err.response?.status,
        data: err.response?.data || err.message,
      });
      setMessage(err.response?.data?.message || "Failed to create blog.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">Create Blog</h2>

      {message && (
        <div className="alert alert-info" role="alert">
          {message}
        </div>
      )}

      <BlogForm
        onSubmit={handleCreate}
        buttonText={loading ? "Creating..." : "Create"}
      />

      {debug && (
        <div className="mt-3">
          <h6>Server debug</h6>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f8f9fa",
              padding: 10,
            }}
          >
            {JSON.stringify(debug, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default CreateBlog;