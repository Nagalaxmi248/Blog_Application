import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debounceRef = useRef(null);

  const fetchBlogs = async (search = q, p = page) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/blogs?q=${encodeURIComponent(search)}&page=${p}&limit=6`);
      setBlogs(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (val) => {
    setQ(val);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchBlogs(val, 1);
    }, 400);
  };

  const goPage = (p) => {
    setPage(p);
    fetchBlogs(q, p);
  };

  return (
    <div className="container py-4">
      <div className="mb-3">
        <input value={q} onChange={(e)=>handleSearch(e.target.value)} className="form-control" placeholder="Search blogs..." />
      </div>

      {loading ? (
        <div className="text-center py-5">Loading...</div>
      ) : (
        <>
          <div className="row">
            {blogs.map((blog) => (
              <div key={blog._id} className="col-md-6 mb-3">
                <div className="card h-100">
                  {blog.image && <img src={blog.image} className="card-img-top" alt={blog.title} style={{objectFit:'cover', height:200}} />}
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{blog.title}</h5>
                    <p className="card-text text-truncate">{blog.content}</p>
                    <Link to={`/blogs/${blog._id}`} className="mt-auto btn btn-outline-primary">Read</Link>
                  </div>
                  <div className="card-footer text-muted small">
                    ✍️ By {blog.author?.username || "Anonymous"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <nav>
            <ul className="pagination">
              <li className={`page-item ${page===1?'disabled':''}`}><button className="page-link" onClick={()=>goPage(page-1)}>Prev</button></li>
              {Array.from({length: totalPages}).map((_,i)=>(
                <li key={i} className={`page-item ${page===i+1?'active':''}`}><button className="page-link" onClick={()=>goPage(i+1)}>{i+1}</button></li>
              ))}
              <li className={`page-item ${page===totalPages?'disabled':''}`}><button className="page-link" onClick={()=>goPage(page+1)}>Next</button></li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}

export default Home;
