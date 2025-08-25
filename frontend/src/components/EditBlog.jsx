import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTitle(res.data.title);
        setContent(res.data.content);
      } catch (err) {
        setError(err.response?.data?.message || "❌ Failed to fetch blog");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/blogs/${id}`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("✅ Blog updated successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "❌ Failed to update blog");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading blog...</div>;

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ width: "600px" }}>
        <h2 className="text-center mb-4">✏️ Edit Blog</h2>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Content</label>
            <textarea
              className="form-control"
              rows="5"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={loading}
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn btn-warning w-100"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Blog"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditBlog;
