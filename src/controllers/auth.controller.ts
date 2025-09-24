import { Request, Response, NextFunction } from "express";
import {
  registerService,
  loginService,
  refreshTokenService,
  updateDeviceTokenService,
} from "../services/auth.service";
import { registerSchema, loginSchema, updateDeviceTokenSchema } from "../validators/auth.validator";
import { MESSAGES } from "../messages";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: MESSAGES.AUTH.INVALID_DATA,
      issues: result.error.issues, // Mostra erros amigáveis
    });
  }

  const { name, email, password } = req.body as any;
  try {
    const userService = await registerService(name, email, password);
    return res.status(201).send(userService);
  } catch (error) {
    return next(error);
  }
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: MESSAGES.USER.INVALID_CREDENTIALS,
      issues: result.error.issues, // Mostra erros amigáveis
    });
  }

  const { email, password } = req.body as any;
  try {
    const loginResult = await loginService(email, password);
    return res.status(200).send(loginResult);
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(400)
      .json({ error: MESSAGES.USER.REFRESH_TOKEN_REQUIRED });
  }

  try {
    const newTokens = await refreshTokenService(refreshToken);
    return res.status(200).json(newTokens);
  } catch (error) {
    return next(error);
  }
};

export const updateDeviceToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id;
  
  const result = updateDeviceTokenSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: MESSAGES.AUTH.INVALID_DATA,
      issues: result.error.issues,
    });
  }

  const { deviceToken } = result.data;

  try {
    const user = await updateDeviceTokenService(userId, deviceToken);

    return res.status(200).json({
      success: true,
      message: MESSAGES.USER.DEVICE_TOKEN_UPDATED,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};
