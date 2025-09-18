// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";

/**
 * AdminDashboard
 * - Lists users (GET /api/admin/users)
 * - Promote/Demote user (PUT /api/admin/users/:id/role) { role }
 * - Delete user (DELETE /api/admin/users/:id)
 *
 * Requires token in localStorage and backend admin endpoints.
 */
export default function AdminDashboard() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { token, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(null); // id currently working

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/api/admin/users`, authHeaders());
      setUsers(res.data || []);
    } catch (err) {
      console.error("Fetch users failed:", err);
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (userId, newRole) => {
    if (!window.confirm(`Change role to "${newRole}"?`)) return;
    setWorking(userId);
    try {
      await axios.put(`${API_BASE}/api/admin/users/${userId}/role`, { role: newRole }, authHeaders());
      await fetchUsers();
    } catch (err) {
      console.error("Change role failed:", err);
      alert(err.response?.data?.message || "Failed to change role");
    } finally {
      setWorking(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;
    setWorking(userId);
    try {
      await axios.delete(`${API_BASE}/api/admin/users/${userId}`, authHeaders());
      await fetchUsers();
    } catch (err) {
      console.error("Delete user failed:", err);
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setWorking(null);
    }
  };

  if (!isAdmin) return <div className="alert alert-danger">Access denied — admin only.</div>;

  return (
    <div className="container py-4">
      <h2>Admin: User management</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3">
        <button className="btn btn-sm btn-secondary" onClick={fetchUsers} disabled={loading}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div>Loading users…</div>
      ) : users.length === 0 ? (
        <div className="alert alert-info">No users found.</div>
      ) : (
        <div className="list-group">
          {users.map((u) => (
            <div key={u._id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <div style={{ fontWeight: 600 }}>
                  {u.username || "(no username)"} <small className="text-muted">— {u.email}</small>
                </div>
                <div>
                  <small className="text-muted">role: {u.role} · joined: {new Date(u.createdAt || u.createdAt).toLocaleString()}</small>
                </div>
              </div>

              <div className="d-flex align-items-center">
                {/* Promote/demote dropdown */}
                <div className="me-2">
                  <select
                    className="form-select form-select-sm"
                    value={u.role}
                    onChange={(e) => changeRole(u._id, e.target.value)}
                    disabled={working === u._id}
                    style={{ minWidth: 140 }}
                  >
                    <option value="user">user</option>
                    <option value="moderator">moderator</option>
                    <option value="admin">admin</option>
                  </select>
                </div>

                {/* Delete user */}
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteUser(u._id)}
                  disabled={working === u._id}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
