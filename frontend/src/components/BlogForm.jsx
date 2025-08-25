import { useState } from "react";

function BlogForm({ onSubmit, initialData = { title: "", content: "" }, buttonText = "Add Blog" }) {
  const [form, setForm] = useState(initialData);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ title: "", content: "" }); // Reset after submit
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <br />
      <textarea
        name="content"
        placeholder="Content"
        value={form.content}
        onChange={handleChange}
        required
      />
      <br />
      <button type="submit">{buttonText}</button>
    </form>
  );
}

export default BlogForm;