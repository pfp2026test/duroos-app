import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

const router = Router();

// NOTE: there's deliberately no self-signup route for admins — create
// admin accounts by hand via Prisma Studio (set passwordHash with
// bcrypt.hashSync("somepassword", 10) in a one-off script) rather than
// exposing open registration for privileged accounts.
router.post("/login", async (req, res, next) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const { password } = req.body;
    const admin = await prisma.admin.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.id, role: admin.role, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );
    res.json({ token, admin: { id: admin.id, name: admin.name, role: admin.role } });
  } catch (e) {
    next(e);
  }
});

export default router;
