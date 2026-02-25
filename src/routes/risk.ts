import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { riskEvaluateSchema } from '../schemas/index.js';
import type { RiskEvaluateBody } from '../schemas/index.js';

export const riskRouter = Router();

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
