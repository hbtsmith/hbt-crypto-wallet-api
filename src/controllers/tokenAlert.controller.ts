import { Request, Response, NextFunction } from "express";
import { validateTokenAlertInput, validateTokenAlertUpdateInput } from "../validators/tokenAlert.validator";
import {
  createTokenAlertService,
  listTokenAlertService,
  getTokenAlertService,
  updateTokenAlertService,
  deleteTokenAlertService,
  activateTokenAlertService,
  deactivateTokenAlertService,
} from "../services/tokenAlert.service";
import { MESSAGES } from "../messages";

// Função helper para validar UUID
function isValidUUID(id: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(id);
}

export async function listTokenAlert(req: Request, res: Response) {
  const userId = req.user!.id;
  try {
    const {
      symbol,
      active,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const alerts = await listTokenAlertService(userId, {
      symbol: String(symbol || ""),
      ...(active !== undefined && { active: active === "true" }),
      page: Number(page),
      limit: Number(limit),
      sortBy: String(sortBy),
      order: order === "desc" ? "desc" : "asc",
    });

    return res.status(200).json(alerts);
  } catch (err) {
    return res.status(500).json({ error: MESSAGES.TOKEN_ALERT.LIST_FAILED });
  }
}

export async function createTokenAlert(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;

  const error = validateTokenAlertInput(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const tokenAlert = await createTokenAlertService(userId, req.body);
    return res.status(201).json(tokenAlert);
  } catch (error) {
    next(error);
  }
}

export async function getTokenAlert(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;

  const { id } = req.params;
  if (typeof id !== "string" || !isValidUUID(id)) {
    return res.status(400).json({ error: MESSAGES.TOKEN_ALERT.INVALID_ID });
  }

  try {
    const tokenAlert = await getTokenAlertService(userId, id);
    return res.status(200).json(tokenAlert);
  } catch (error) {
    next(error);
  }
}

export async function updateTokenAlert(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;

  const { id } = req.params;
  if (typeof id !== "string" || !isValidUUID(id)) {
    return res.status(400).json({ error: MESSAGES.TOKEN_ALERT.INVALID_ID });
  }

  const error = validateTokenAlertUpdateInput(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const tokenAlert = await updateTokenAlertService(id, userId, req.body);
    return res.status(200).json(tokenAlert);
  } catch (error) {
    next(error);
  }
}

export async function deleteTokenAlert(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;

  const { id } = req.params;
  if (typeof id !== "string" || !isValidUUID(id)) {
    return res.status(400).json({ error: MESSAGES.TOKEN_ALERT.INVALID_ID });
  }

  try {
    await deleteTokenAlertService(id, userId);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function activateTokenAlert(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;

  const { id } = req.params;
  if (typeof id !== "string" || !isValidUUID(id)) {
    return res.status(400).json({ error: MESSAGES.TOKEN_ALERT.INVALID_ID });
  }

  try {
    const tokenAlert = await activateTokenAlertService(id, userId);
    return res.status(200).json({
      message: MESSAGES.TOKEN_ALERT.ACTIVATED_SUCCESS,
      data: tokenAlert,
    });
  } catch (error) {
    next(error);
  }
}

export async function deactivateTokenAlert(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user!.id;

  const { id } = req.params;
  if (typeof id !== "string" || !isValidUUID(id)) {
    return res.status(400).json({ error: MESSAGES.TOKEN_ALERT.INVALID_ID });
  }

  try {
    const tokenAlert = await deactivateTokenAlertService(id, userId);
    return res.status(200).json({
      message: MESSAGES.TOKEN_ALERT.DEACTIVATED_SUCCESS,
      data: tokenAlert,
    });
  } catch (error) {
    next(error);
  }
}
