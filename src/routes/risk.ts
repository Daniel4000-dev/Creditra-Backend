import { Router, Request, Response } from "express";
import { evaluateWallet, InvalidWalletAddressError } from "../services/riskService.js";
import { isValidStellarPublicKey } from "../utils/stellarAddress.js";

const router = Router();

router.post(
  "/evaluate",
  async (req: Request, res: Response): Promise<void> => {
    const { walletAddress } = req.body as { walletAddress?: string };

    if (typeof walletAddress !== "string" || walletAddress.trim().length === 0) {
      res.status(400).json({ error: "walletAddress is required" });
      return;
    }

    const normalizedWalletAddress = walletAddress.trim();
    if (!isValidStellarPublicKey(normalizedWalletAddress)) {
      res.status(400).json({ error: "Invalid wallet address format." });
      return;
    }

    try {
      const result = await evaluateWallet(normalizedWalletAddress);
      res.json(result);
    } catch (err) {
      if (err instanceof InvalidWalletAddressError) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: "Unable to evaluate wallet at this time." });
    }
  },
);

export default router;
