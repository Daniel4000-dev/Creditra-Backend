import { Router } from 'express';

export const riskRouter = Router();

riskRouter.post('/evaluate', (req, res) => {
  const { walletAddress } = req.body ?? {};
  if (!walletAddress) {
    return res.status(400).json({ error: 'walletAddress required' });
  }
  res.json({
    walletAddress,
    riskScore: 0,
    creditLimit: '0',
    interestRateBps: 0,
    message: 'Risk engine not yet connected; placeholder response.',
  });
});
