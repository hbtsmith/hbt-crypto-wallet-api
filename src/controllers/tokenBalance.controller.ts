import { Request, Response } from "express";
import { validateTokenBalanceInput } from "../validators/tokenBalance.validator";
import {
  createTokenBalanceService,
  listTokenBalanceService,
  getTokenBalanceService,
  updateTokenBalanceService,
  deleteTokenBalanceService,
} from "../services/tokenBalance.service";
import { MESSAGES } from "../messages";

export async function createTokenBalance(req: Request, res: Response) {
  const userId = req.user!.id;
  const error = validateTokenBalanceInput(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const tokenId = req.body.tokenId;
    if (!tokenId) {
      return res.status(400).json({ error: MESSAGES.TOKEN.NOT_FOUND });
    }
    const data = req.body;
    const tokenBalance = await createTokenBalanceService(userId, tokenId, data);
    res.status(201).json(tokenBalance);
  } catch (error) {}
}

export async function listTokenBalance(req: Request, res: Response) {
  const userId = req.user!.id;
  const { tokenId, page, limit, sortBy, order } = req.query;

  if (!tokenId || typeof tokenId !== "string") {
    return res.status(400).json({ error: MESSAGES.TOKEN.NOT_FOUND });
  }
  try {
    const balances = await listTokenBalanceService(userId, tokenId as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: String(sortBy),
      order: order === "desc" ? "desc" : "asc",
    });
    return res.status(200).json(balances);
  } catch (error) {
    return res.status(500).json({ error: MESSAGES.SYSTEM.ERROR });
  }
}

export async function getTokenBalance(req: Request, res: Response) {
  const userId = req.user!.id;
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: MESSAGES.TOKEN_BALANCE.NOT_FOUND });
  }

  try {
    const balance = await getTokenBalanceService(userId, id);
    return res.status(200).json(balance);
  } catch (error) {
    return res.status(500).json({ error: MESSAGES.SYSTEM.ERROR });
  }
}

export async function updateTokenBalance(req: Request, res: Response) {
  const userId = req.user!.id;
  const id = req.params.id;
  const data = req.body;

  if (!id) {
    return res.status(400).json({ error: MESSAGES.TOKEN_BALANCE.NOT_FOUND });
  }

  try {
    const updated = await updateTokenBalanceService(userId, id, data);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: MESSAGES.SYSTEM.ERROR });
  }
}

export async function deleteTokenBalance(req: Request, res: Response) {
  const userId = req.user!.id;
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: MESSAGES.TOKEN_BALANCE.NOT_FOUND });
  }

  try {
    await deleteTokenBalanceService(userId, id);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: MESSAGES.SYSTEM.ERROR });
  }
}
