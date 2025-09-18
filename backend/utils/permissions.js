// backend/utils/permissions.js
export function isSameId(a, b) {
  if (!a || !b) return false;
  return String(a) === String(b);
}

export function isAuthorOrAdmin(user, author) {
  if (!user) return false;
  if (user.role === "admin") return true;
  return isSameId(user._id || user.id, author?._id || author?.id || author);
}
