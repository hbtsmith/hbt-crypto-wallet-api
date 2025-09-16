import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} from "../utils/jwt";
import { MESSAGES } from "../messages";
import { UnauthorizedError } from "../helpers/api-errors";

export const registerService = async (
  name: string,
  email: string,
  password: string
) => {
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) throw new UnauthorizedError(MESSAGES.USER.ALREADY_REGISTERED);

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  const accessTokenExpirationTime = parseInt(
    process.env.ACCESS_TOKEN_EXPIRATION_HOURS || "8"
  );

  const token = signAccessToken(
    { id: user.id, email: user.email },
    `${accessTokenExpirationTime}h`
  );
  return { token, user };
};

export const loginService = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError(MESSAGES.USER.INVALID_CREDENTIALS);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new UnauthorizedError(MESSAGES.USER.INVALID_CREDENTIALS);

  const refreshTokenExpirationDays = parseInt(
    process.env.REFRESH_TOKEN_EXPIRATION_DAYS || "1"
  );

  const accessTokenExpirationTime = parseInt(
    process.env.ACCESS_TOKEN_EXPIRATION_HOURS || "8"
  );

  const token = signAccessToken(
    { id: user.id, email: user.email },
    `${accessTokenExpirationTime}h`
  );
  const refreshToken = signRefreshToken(
    { id: user.id, email: user.email },
    `${refreshTokenExpirationDays}d`
  );

  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  const expiresAt = new Date(
    Date.now() + refreshTokenExpirationDays * 24 * 60 * 60 * 1000
  );

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt, // expires in 7 days
    },
  });

  return { token, refreshToken, refreshTokenExpiresAt: expiresAt, user };
};

export const refreshTokenService = async (refreshToken: string) => {
  try {
    const payload = verifyRefreshToken(refreshToken);

    if (
      typeof payload !== "object" ||
      payload === null ||
      !("id" in payload) ||
      !("email" in payload)
    ) {
      throw new UnauthorizedError(MESSAGES.USER.INVALID_CREDENTIALS);
    }
    const accessTokenExpirationTime = parseInt(
      process.env.ACCESS_TOKEN_EXPIRATION_HOURS || "8"
    );

    const { id, email } = payload as { id: string; email: string };
    const newToken = signAccessToken(
      { id, email },
      `${accessTokenExpirationTime}h`
    );
    return { token: newToken };
  } catch (error) {
    if (error instanceof Error) {
      throw new UnauthorizedError(error.message);
    }
    throw new UnauthorizedError(String(error));
  }
};
