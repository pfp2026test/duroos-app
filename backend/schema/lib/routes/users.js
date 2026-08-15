import { Router } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { requireUser } from "../middleware/requireUser.js";

const router = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, name } = credentialsSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "An account with that email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash, name } });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    next(e);
  }
});

router.get("/me", requireUser, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    res.json(user);
  } catch (e) {
    next(e);
  }
});

export default router;
