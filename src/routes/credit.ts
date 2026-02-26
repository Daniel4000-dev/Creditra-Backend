import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import {
  createCreditLineSchema,
  drawSchema,
  repaySchema,
} from '../schemas/index.js';
import type { CreateCreditLineBody, DrawBody, RepayBody } from '../schemas/index.js';
import { Router, Request, Response } from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import {
  listCreditLines,
  getCreditLine,
  suspendCreditLine,
  closeCreditLine,
  CreditLineNotFoundError,
  InvalidTransitionError,
} from "../services/creditService.js";

const router = Router();

function handleServiceError(err: unknown, res: Response): void {
  if (err instanceof CreditLineNotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }
  if (err instanceof InvalidTransitionError) {
    res.status(409).json({ error: err.message });
    return;
  }
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: message });
}

router.get("/lines", (_req: Request, res: Response): void => {
  res.json({ data: listCreditLines() });
});


router.get("/lines/:id", (req: Request, res: Response): void => {
  const line = getCreditLine(req.params["id"] as string);
  if (!line) {
    res.status(404).json({ error: `Credit line "${req.params["id"]}" not found.` });
    return;
  }
  res.json({ data: line });
});

/** Create a new credit line */
creditRouter.post('/lines', validateBody(createCreditLineSchema), (req, res) => {
  const { walletAddress, requestedLimit } = req.body as CreateCreditLineBody;
  res.status(201).json({
    id: 'placeholder-id',
    walletAddress,
    requestedLimit,
    status: 'pending',
    message: 'Credit line creation not yet implemented; placeholder response.',
  });
});

/** Draw from a credit line */
creditRouter.post('/lines/:id/draw', validateBody(drawSchema), (req, res) => {
  const { amount } = req.body as DrawBody;
  res.json({
    id: req.params.id,
    amount,
    message: 'Draw not yet implemented; placeholder response.',
  });
});

/** Repay a credit line */
creditRouter.post('/lines/:id/repay', validateBody(repaySchema), (req, res) => {
  const { amount } = req.body as RepayBody;
  res.json({
    id: req.params.id,
    amount,
    message: 'Repay not yet implemented; placeholder response.',
  });
});
router.post(
  "/lines/:id/suspend",
  adminAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const line = suspendCreditLine(req.params["id"] as string);
      res.json({ data: line, message: "Credit line suspended." });
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

router.post(
  "/lines/:id/close",
  adminAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const line = closeCreditLine(req.params["id"] as string);
      res.json({ data: line, message: "Credit line closed." });
    } catch (err) {
      handleServiceError(err, res);
    }
  },
);

export default router;
