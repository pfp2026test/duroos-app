import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const playlists = await prisma.playlist.findMany({
      include: { book: true, duroos: { where: { status: "PUBLISHED" }, orderBy: { orderInPlaylist: "asc" } } },
    });
    res.json(playlists);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: req.params.id },
      include: { book: true, duroos: { where: { status: "PUBLISHED" }, orderBy: { orderInPlaylist: "asc" } } },
    });
    if (!playlist) return res.status(404).json({ error: "Not found" });
    res.json(playlist);
  } catch (e) {
    next(e);
  }
});

const createSchema = z.object({
  name: z.string().min(1),
  nameArabic: z.string().optional(),
  description: z.string().optional(),
  bookId: z.string().optional(),
});

router.post("/", requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const playlist = await prisma.playlist.create({
      data: { ...data, createdById: req.admin.id },
    });
    res.status(201).json(playlist);
  } catch (e) {
    next(e);
  }
});

// Reorder duroos within a playlist: body = [{ id, orderInPlaylist }, ...]
router.patch("/:id/order", requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]), async (req, res, next) => {
  try {
    const updates = z
      .array(z.object({ id: z.string(), orderInPlaylist: z.number().int() }))
      .parse(req.body);
    await prisma.$transaction(
      updates.map((u) =>
        prisma.duroos.update({ where: { id: u.id }, data: { orderInPlaylist: u.orderInPlaylist } })
      )
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
