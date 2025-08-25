import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        setBlog(res.data);
      } catch (err) {
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]); // ✅ no warning now

  if (loading) {
    return <p className="text-center mt-5 text-muted">Loading blog...</p>;
  }

  if (!blog) {
    return <p className="text-center mt-5 text-danger">Blog not found.</p>;
  }

  return (
    <div className="container py-5">
      <div className="card shadow-lg border-0 rounded-3">
        <div className="card-body p-4">
          <h1 className="card-title fw-bold text-primary">{blog.title}</h1>
          <p className="text-muted mb-3">
            ✍️ By <strong>{blog.author?.username || "Anonymous"}</strong> •{" "}
            {new Date(blog.createdAt).toLocaleDateString()}
          </p>
          <hr />
          <p className="card-text fs-5" style={{ lineHeight: "1.7" }}>
            {blog.content}
          </p>
          <Link to="/" className="btn btn-outline-primary mt-4">
            ⬅ Back to Blogs
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BlogDetails;