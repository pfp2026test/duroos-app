import { Router } from "express";
import { z } from "zod";
import prisma from "../prisma.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { requireUser } from "../../middleware/requireUser.js";

const router = Router();

router.get("/duroos/:duroosId", async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { duroosId: req.params.duroosId, hidden: false },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(comments);
  } catch (e) {
    next(e);
  }
});

router.post("/duroos/:duroosId", requireUser, async (req, res, next) => {
  try {
    const { body } = z.object({ body: z.string().min(1) }).parse(req.body);
    const comment = await prisma.comment.create({
      data: { duroosId: req.params.duroosId, userId: req.user.id, body },
    });
    res.status(201).json(comment);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/hide", requireAdmin(), async (req, res, next) => {
  try {
    const comment = await prisma.comment.update({
      where: { id: req.params.id },
      data: { hidden: true },
    });
    res.json(comment);
  } catch (e) {
    next(e);
  }
});

export default router;
