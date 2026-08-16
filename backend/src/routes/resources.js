import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.get("/duroos/:duroosId", async (req, res, next) => {
  try {
    const resources = await prisma.resource.findMany({
      where: { duroosId: req.params.duroosId, status: "VERIFIED" },
      include: { citations: true },
    });
    res.json(resources);
  } catch (e) {
    next(e);
  }
});

router.post("/duroos/:duroosId/generate", requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN"]), async (req, res, next) => {
  try {
    const { language } = req.body;
    const resource = await prisma.resource.create({
      data: {
        duroosId: req.params.duroosId,
        language,
        title: "Untitled resource",
        content: "",
        status: "GENERATING",
        requestedById: req.admin.id,
      },
    });
    res.status(201).json(resource);
  } catch (e) {
    next(e);
  }
});

router.get("/admin/pending", requireAdmin(), async (req, res, next) => {
  try {
    const pending = await prisma.resource.findMany({
      where: { status: "PENDING_APPROVAL" },
      include: { citations: true, duroos: true },
    });
    res.json(pending);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/approve", requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN", "REVIEWER"]), async (req, res, next) => {
  try {
    const resource = await prisma.resource.update({
      where: { id: req.params.id },
      data: { status: "VERIFIED", approvedById: req.admin.id, approvedAt: new Date() },
    });
    res.json(resource);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/reject", requireAdmin(["SUPER_ADMIN", "CONTENT_ADMIN", "REVIEWER"]), async (req, res, next) => {
  try {
    const resource = await prisma.resource.update({
      where: { id: req.params.id },
      data: { status: "REJECTED" },
    });
    res.json(resource);
  } catch (e) {
    next(e);
  }
});

export default router;
