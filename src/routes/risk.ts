import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { riskEvaluateSchema } from '../schemas/index.js';
import type { RiskEvaluateBody } from '../schemas/index.js';
import { Router, Request, Response } from "express";
import { evaluateWallet } from "../services/riskService.js";

const router = Router();

riskRouter.post('/evaluate', validateBody(riskEvaluateSchema), (req, res) => {
  const { walletAddress } = req.body as RiskEvaluateBody;
  res.json({
    walletAddress,
    riskScore: 0,
    creditLimit: '0',
    interestRateBps: 0,
    message: 'Risk engine not yet connected; placeholder response.',
  });
});
router.post(
  "/evaluate",
  async (req: Request, res: Response): Promise<void> => {
    const { walletAddress } = req.body as { walletAddress?: string };

    if (!walletAddress) {
      res.status(400).json({ error: "walletAddress is required" });
      return;
    }

    try {
      const result = await evaluateWallet(walletAddress);
      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(400).json({ error: message });
    }
  },
);

export default router;
