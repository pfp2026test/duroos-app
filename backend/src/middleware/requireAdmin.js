import jwt from "jsonwebtoken";

export function requireAdmin(allowedRoles = null) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing admin token" });
    }
    try {
      const token = header.replace("Bearer ", "");
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (allowedRoles && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      req.admin = payload;
      next();
    } catch (e) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}
