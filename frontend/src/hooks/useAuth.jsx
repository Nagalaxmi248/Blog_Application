// src/hooks/useAuth.jsx
import { useMemo } from "react";

export default function useAuth() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const user = useMemo(() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id: payload.id || payload._id,
        username: payload.username,
        role: payload.role || "user",
        raw: payload,
      };
    } catch (e) {
      console.warn("Invalid token", e);
      return null;
    }
  }, [token]);

  const isAdmin = user?.role === "admin";
  return { token, user, isAdmin };
}