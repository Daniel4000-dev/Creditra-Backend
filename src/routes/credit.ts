import { Router } from 'express';
import type { Request, Response } from 'express';
import { validateBody } from '../middleware/validate.js';
import {
  createCreditLineSchema,
  drawSchema,
  repaySchema,
} from '../schemas/index.js';
import type { CreateCreditLineBody, DrawBody, RepayBody } from '../schemas/index.js';
import { Container } from '../container/Container.js';
import { createApiKeyMiddleware } from '../middleware/auth.js';
import { loadApiKeys } from '../config/apiKeys.js';
import { ok, fail } from "../utils/response.js";
import { creditLines } from '../data/creditLines.js';
import { paginateAndFilter } from '../utils/paginate.js';
import {
  CreditLineNotFoundError,
  getTransactions,
  suspendCreditLine,
  closeCreditLine,
  drawFromCreditLine
} from "../services/creditService.js";

export const creditRouter = Router();
const container = Container.getInstance();
const requireApiKey = createApiKeyMiddleware(() => loadApiKeys());

function handleServiceError(err: unknown, res: Response): void {
  if (err instanceof CreditLineNotFoundError) {
    fail(res, err.message, 404);
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
}

/** * GET /lines — Supports Pagination, Filtering, and Sorting
 * Satisfies Requirement for Issue #22
 */
creditRouter.get('/lines', async (req: Request, res: Response) => {
  try {
    const q = req.query;
    // Use the paginate utility if pagination/filtering params are present
    if (q.page || q.status || q.borrower || q.pageSize || q.sortBy) {
      const result = paginateAndFilter(creditLines, q as any);
      return res.json(result);
    }

    // Fallback to Container logic for default requests
    const offsetNum = q.offset ? parseInt(q.offset as string, 10) : 0;
    const limitNum = q.limit ? parseInt(q.limit as string, 10) : 10;
    
    const lines = await container.creditLineService.getAllCreditLines(offsetNum, limitNum);
    const total = await container.creditLineService.getCreditLineCount();
    
    return res.json({ 
      items: lines, 
      creditLines: lines, 
      total,
      page: Math.floor(offsetNum / limitNum) + 1,
      pageSize: limitNum,
      pagination: { total, offset: offsetNum, limit: limitNum }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch credit lines' });
  }
});

/** GET /lines/:id */
creditRouter.get('/lines/:id', async (req: Request, res: Response) => {
  try {
    const creditLine = await container.creditLineService.getCreditLine(req.params.id);
    if (!creditLine) {
      return res.status(404).json({ error: 'Credit line not found' });
    }
    res.json(creditLine);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch credit line' });
  }
});

/** POST /lines */
creditRouter.post('/lines', validateBody(createCreditLineSchema), async (req: Request, res: Response) => {
  try {
    const { walletAddress, creditLimit, interestRateBps } = req.body as CreateCreditLineBody;
    const creditLine = await container.creditLineService.createCreditLine({
      walletAddress,
      creditLimit,
      interestRateBps: interestRateBps ?? 0
    });
    res.status(201).json(creditLine);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Validation failed' });
  }
});

/** POST /lines/:id/draw */
creditRouter.post('/lines/:id/draw', validateBody(drawSchema), async (req: Request, res: Response) => {
  try {
    const { amount, borrowerId } = req.body as DrawBody;
    const updated = drawFromCreditLine({
      id: req.params.id,
      borrowerId,
      amount,
    });
    res.status(200).json({ message: 'Draw successful', creditLine: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default creditRouter;