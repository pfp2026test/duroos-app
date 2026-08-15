import jwt from "jsonwebtoken";

// Verifies a regular user's JWT (from /api/users/login or /signup) and
// attaches { id, email } to req.user. Use this to gate any route that
// should only work for signed-in users.
export function requireUser(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Sign in to continue" });
  }
  try {
    const token = header.replace("Bearer ", "");
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "Your session expired — sign in again" });
  }
}
