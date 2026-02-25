import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import {
  createCreditLineSchema,
  drawSchema,
  repaySchema,
} from '../schemas/index.js';
import type { CreateCreditLineBody, DrawBody, RepayBody } from '../schemas/index.js';

export const creditRouter = Router();

creditRouter.get('/lines', (_req, res) => {
  res.json({ creditLines: [] });
});

creditRouter.get('/lines/:id', (req, res) => {
  res.status(404).json({ error: 'Credit line not found', id: req.params.id });
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
