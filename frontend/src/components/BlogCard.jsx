// src/components/BlogCard.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function BlogCard({ blog }) {
  const navigate = useNavigate();

  const excerpt = useMemo(() => {
    if (!blog.content) return "";
    const max = 140;
    const cleaned = String(blog.content).replace(/\s+/g, " ").trim();
    return cleaned.length > max ? cleaned.slice(0, max).trim() + "…" : cleaned;
  }, [blog.content]);

  return (
    <div className="card h-100 shadow-sm">
      {blog.image && (
        <img
          src={blog.image}
          alt={blog.title}
          className="card-img-top"
          style={{ maxHeight: 220, objectFit: "cover" }}
        />
      )}

      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{blog.title}</h5>
        <p className="card-text text-muted" style={{ whiteSpace: "pre-wrap" }}>{excerpt}</p>

        <div className="mt-auto d-flex justify-content-between align-items-center">
          <small className="text-muted">By {blog.author?.username || blog.author?.email || "Unknown"}</small>

          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => navigate(`/blogs/${blog._id}`)}
          >
            Read more
          </button>
        </div>
      </div>
    </div>
  );
}
