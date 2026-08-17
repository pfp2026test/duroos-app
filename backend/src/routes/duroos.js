import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

// ---- Public: list & fetch published duroos ----

router.get("/", async (req, res, next) => {
  try {
    const { language, speakerId, bookId, playlistId, faculty } = req.query;
    const duroos = await prisma.duroos.findMany({
      where: {
        status: "PUBLISHED",
        ...(language && { language }),
        ...(speakerId && { speakerId }),
        ...(bookId && { bookId }),
        ...(playlistId && { playlistId }),
        ...(faculty && { faculty }),
      },
      include: { speaker: true, book: true, playlist: true },
      orderBy: [{ seriesName: "asc" }, { episodeNumber: "asc" }, { publishedAt: "desc" }],
    });
    res.json(duroos);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const durs = await prisma.duroos.findUnique({
      where: { id: req.params.id },
      include: { speaker: true, book: true, playlist: true, captions: true, resources: true },
    });
    if (!durs || durs.status !== "PUBLISHED") {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(durs);
  } catch (e) {
    next(e);
  }
});

// ---- Admin: create/edit/publish ----

const createSchema = z.object({
  title: z.string().min(1),
  titleArabic: z.string().optional(),
  description: z.string().optional(),
  language: z.enum(["ARABIC", "ENGLISH"]),
  youtubeUrl: z.string().url(),
  youtubeVideoId: z.string().min(1),
  faculty: z.enum(["AQEEDAH", "FIQH", "HADITH", "TAFSEER", "ARABIC_LANGUAGE", "SEERAH", "TARBIYAH_TAZKIYAH"]).optional(),
  learningObjectives: z.string().optional(),
  seriesName: z.string().optional(),
  episodeNumber: z.number().int().optional(),
  speakerId: z.string().optional(),
  bookId: z.string().optional(),
  playlistId: z.string().optional(),
  orderInPlaylist: z.number().int().optional(),
});

router.post("/", requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const durs = await prisma.duroos.create({
      data: { ...data, uploadedById: req.admin.id, status: "DRAFT" },
    });
    res.status(201).json(durs);
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]), async (req, res, next) => {
  try {
    const data = createSchema.partial().parse(req.body);
    const durs = await prisma.duroos.update({ where: { id: req.params.id }, data });
    res.json(durs);
  } catch (e) {
    next(e);
  }
});

// Kicks off AI translation/captioning. Actual generation happens in a
// background worker (see backend/src/jobs) — this just flips status.
router.post("/:id/request-translation", requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]), async (req, res, next) => {
  try {
    const durs = await prisma.duroos.update({
      where: { id: req.params.id },
      data: { status: "PROCESSING" },
    });
    // TODO: enqueue translation/caption/voiceover job
    res.json(durs);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/publish", requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]), async (req, res, next) => {
  try {
    const durs = await prisma.duroos.update({
      where: { id: req.params.id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    res.json(durs);
  } catch (e) {
    next(e);
  }
});

// ---- Admin: review queue ----
router.get("/admin/queue", requireAdmin(), async (req, res, next) => {
  try {
    const queue = await prisma.duroos.findMany({
      where: { status: { in: ["DRAFT", "PROCESSING", "IN_REVIEW"] } },
      include: { speaker: true, book: true, uploadedBy: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(queue);
  } catch (e) {
    next(e);
