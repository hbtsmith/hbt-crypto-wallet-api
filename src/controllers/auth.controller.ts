import { Request, Response, NextFunction } from "express";
import {
  registerService,
  loginService,
  refreshTokenService,
} from "../services/auth.service";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import { MESSAGES } from "../messages";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Dados inválidos",
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
