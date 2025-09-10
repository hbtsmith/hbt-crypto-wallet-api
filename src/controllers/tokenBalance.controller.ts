import { Request, Response, NextFunction } from "express";
import { validateTokenBalanceInput } from "../validators/tokenBalance.validator";
import {
  createTokenBalanceService,
  listTokenBalanceService,
  getTokenBalanceService,
  updateTokenBalanceService,
  deleteTokenBalanceService,
  getTotalAmountBalanceService,
  getTotalValueBalanceService,
} from "../services/tokenBalance.service";
import { MESSAGES } from "../messages";

export async function createTokenBalance(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;
  const tokenId = req.body!.tokenId;
  const error = validateTokenBalanceInput(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  try {
    if (!tokenId) {
      return res.status(404).json({ error: MESSAGES.TOKEN.NOT_FOUND });
    }
    const data = req.body;
    const tokenBalance = await createTokenBalanceService(userId, tokenId, data);
    return res.status(201).json(tokenBalance);
  } catch (error) {
    next(error);
  }
}

export async function listTokenBalance(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;
  const {
    tokenId,
    page = 1,
    limit = 10,
    sortBy = "operationAt",
    order = "desc",
  } = req.query;

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
    console.log(error);
    return next(error);
  }
}

export async function getTokenBalance(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: MESSAGES.TOKEN_BALANCE.NOT_FOUND });
  }

  try {
    const balance = await getTokenBalanceService(userId, id);
    return res.status(200).json(balance);
  } catch (error) {
    return next(error);
  }
}

export async function updateTokenBalance(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
    return next(error);
  }
}

export async function deleteTokenBalance(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: MESSAGES.TOKEN_BALANCE.NOT_FOUND });
  }

  try {
    await deleteTokenBalanceService(userId, id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export async function getTotalAmountBalance(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;
  const tokenId = req.params.tokenId;

  if (!tokenId) {
    return res.status(400).json({ error: MESSAGES.TOKEN.NOT_FOUND });
  }

  try {
    const total = await getTotalAmountBalanceService(userId, tokenId);
    return res.status(200).json(total);
  } catch (error) {
    return next(error);
  }
}

export async function getTotalValueBalance(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;
  const tokenId = req.params.tokenId;

  if (!tokenId) {
    return res.status(400).json({ error: MESSAGES.TOKEN.NOT_FOUND });
  }

  try {
    const total = await getTotalValueBalanceService(userId, tokenId);
    return res.status(200).json(total);
  } catch (error) {
    return next(error);
  }
}
