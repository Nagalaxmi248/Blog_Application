# 📝 MERN Blog Application

A full-stack **Blog Platform** built with the MERN stack (MongoDB, Express.js, React, Node.js).  
It supports **JWT authentication**, **role-based access control**, **blog CRUD operations**, and an **admin dashboard** for managing users and content.

---

## ✨ Features

### 👤 Authentication & Roles
- User registration & login with **JWT-based authentication**.
- Roles:
  - **User** → Create, Read, Update, Delete (CRUD) their own blogs.
  - **Admin** → Full CRUD access to all blogs and users.

### 📝 Blog Management
- Create blog posts with **title, content, and optional image upload**.
- Dashboard with:
  - Blog previews (title, image, excerpt).
  - **Read more** → opens full blog details page with actions.
  - Search (debounced) & Pagination.
- Edit or Delete blogs (restricted to author or admin).
- Optimistic UI for delete (instant removal, rollback on failure).

### 🖼 Images
- Optional image upload with preview before submission.
- Responsive image display in BlogCard and BlogDetails.

### 👨‍💼 Admin Dashboard
- View all users.
- Update user roles (`user`, `admin`).
- Delete users (with safeguard against deleting self).
- Admin can CRUD **all blogs**, not just their own.

### 📱 Frontend (React + Vite + Bootstrap)
- Mobile-friendly responsive UI.
- Navbar with conditional links (Dashboard, Create, Login/Register, Logout).
- BlogCard with **Read more** → BlogDetails page for full content + actions.
- State management with React hooks and JWT decoding.

### ⚙️ Backend (Node.js + Express + MongoDB)
- Routes:
  - `/api/auth` → authentication.
  - `/api/blogs` → blog CRUD.
  - `/api/admin` → admin-only user management.
- Middleware:
  - `protect` → validates JWT and attaches `req.user`.
  - `admin` → ensures admin-only access.
- **Permissions helper** (`isAuthorOrAdmin`) for robust access checks.
- Input validation with `express-validator`.
- MongoDB models: `User`, `Blog`.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v16+
- [MongoDB](https://www.mongodb.com/) (Atlas or local)

### Clone the Repository
```bash
git clone https://github.com/<your-username>/Blog_Application.git
cd Blog_Application
