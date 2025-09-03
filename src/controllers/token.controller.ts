import { Request, Response, NextFunction } from "express";
import { validateTokenInput } from "../validators/token.validator";
import {
  createTokenService,
  listTokenService,
  getTokenService,
  updateTokenService,
  deleteTokenService,
} from "../services/token.service";
import { MESSAGES } from "../messages";

export async function listToken(req: Request, res: Response) {
  const userId = req.user!.id;
  try {
    const {
      name,
      symbol,
      page = 1,
      limit = 10,
      sortBy = "name",
      order = "asc",
    } = req.query;

    const tokens = await listTokenService(userId, {
      name: String(name || ""),
      symbol: String(symbol || ""),
      page: Number(page),
      limit: Number(limit),
      sortBy: String(sortBy),
      order: order === "desc" ? "desc" : "asc",
    });

    return res.status(200).json(tokens);
  } catch (err) {
    return res.status(500).json({ error: MESSAGES.TOKEN.LIST_FAILED });
  }
}

export async function createToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;

  const error = validateTokenInput(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const token = await createTokenService(userId, req.body);
    return res.status(201).json(token);
  } catch (error) {
    next(error);
  }
}

export async function getToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;

  const { id } = req.params;
  if (typeof id !== "string") {
    return res.status(400).json({ error: MESSAGES.TOKEN.INVALID_ID });
  }
  try {
    const token = await getTokenService(userId, id);
    return res.status(200).json(token);
  } catch (error) {
    next(error);
  }
}

export async function updateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;

  const { id } = req.params;
  if (typeof id !== "string") {
    return res.status(400).json({ error: MESSAGES.TOKEN.INVALID_ID });
  }
  try {
    const token = await updateTokenService(id, userId, req.body);
    return res.status(200).json(token);
  } catch (error) {
    next(error);
  }
}

export async function deleteToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;

  const { id } = req.params;
  if (typeof id !== "string") {
    return res.status(400).json({ error: MESSAGES.TOKEN.INVALID_ID });
  }
  try {
    await deleteTokenService(id, userId);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
