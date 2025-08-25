import { Link } from "react-router-dom";

function BlogList({ blogs, onDelete, onEdit, showActions = false }) {
  if (blogs.length === 0) {
    return <p className="text-center text-muted">No blogs found.</p>;
  }

  return (
    <div className="row">
      {blogs.map((blog) => (
        <div key={blog._id} className="col-md-4 mb-4">
          <div className="card shadow h-100">
            <div className="card-body">
              <h5 className="card-title">{blog.title}</h5>
              <p className="card-text">
                {blog.content.length > 100
                  ? blog.content.substring(0, 100) + "..."
                  : blog.content}
              </p>
              <Link to={`/blogs/${blog._id}`} className="btn btn-outline-primary btn-sm">
                Read More
              </Link>
              {showActions && (
                <div className="mt-3 d-flex gap-2">
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => onEdit(blog)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(blog._id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              )}
            </div>
            <div className="card-footer text-muted">Posted recently</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BlogList;
