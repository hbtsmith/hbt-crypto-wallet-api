import jwt from "jsonwebtoken";

import type { Secret } from "jsonwebtoken";
import { MESSAGES } from "../messages";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "changeme";

export const signAccessToken = (payload: object, expiresIn: string = "1h") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
};

export const signRefreshToken = (payload: object, expiresIn: string = "7d") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error(MESSAGES.USER.TOKEN_INVALID);
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error(MESSAGES.USER.TOKEN_INVALID);
  }
};
