// src/components/BlogForm.jsx
import React, { useEffect, useState } from "react";

/**
 * BlogForm
 * Props:
 *  - onSubmit(formObject)   // called with { title, content, image } when user submits
 *  - initialData            // optional { title, content, image }
 *  - buttonText             // optional label for submit button
 */
function BlogForm({ onSubmit, initialData = { title: "", content: "", image: null }, buttonText = "Submit" }) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    content: initialData.content || "",
    image: initialData.image || null,
  });
  const [preview, setPreview] = useState(initialData.image || null);

  // Keep local state in sync if parent changes initialData properties.
  // Use primitive dependencies (title/content/image) to avoid object reference churn.
  useEffect(() => {
    const newTitle = initialData.title || "";
    const newContent = initialData.content || "";
    const newImage = initialData.image || null;

    // Only update if values actually differ to avoid unnecessary setState
    setForm((prev) => {
      if (prev.title === newTitle && prev.content === newContent && prev.image === newImage) {
        return prev; // no changes -> avoid re-render
      }
      return { title: newTitle, content: newContent, image: newImage };
    });

    setPreview((prevPreview) => (prevPreview === newImage ? prevPreview : newImage));
  }, [initialData.title, initialData.content, initialData.image]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large (max 5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      setForm((prev) => ({ ...prev, image: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      title: form.title?.trim(),
      content: form.content?.trim(),
      image: form.image || null,
    };
    onSubmit && onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="mb-4" style={{ maxWidth: 800 }}>
      <div className="mb-3">
        <label className="form-label">Title</label>
        <input
          name="title"
          type="text"
          className="form-control"
          placeholder="Enter title"
          value={form.title}
          onChange={handleChange}
          required
          minLength={3}
          autoComplete="off"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Content</label>
        <textarea
          name="content"
          className="form-control"
          placeholder="Write your post..."
          value={form.content}
          onChange={handleChange}
          rows={8}
          required
          minLength={10}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Image (optional)</label>
        <input type="file" accept="image/*" className="form-control" onChange={handleFile} />
      </div>

      {preview && (
        <div className="mb-3">
          <p className="small mb-1">Image preview:</p>
          <img src={preview} alt="preview" style={{ maxWidth: "100%", height: "auto", borderRadius: 6 }} />
        </div>
      )}

      <button type="submit" className="btn btn-primary">
        {buttonText}
      </button>
    </form>
  );
}

export default BlogForm;
