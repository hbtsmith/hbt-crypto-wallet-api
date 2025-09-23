import { prisma } from "../config/prisma";
import { MESSAGES } from "../messages";
import { directionTypeEnum } from "../helpers/api-consts-enum";
import {
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
} from "../helpers/api-errors";

export async function listTokenAlertService(
  userId: string,
  params: {
    symbol?: string;
    active?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: "asc" | "desc";
  }
) {
  const {
    symbol = "",
    active,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
  } = params;

  const where: any = {
    userId,
    ...(symbol && { symbol: { contains: symbol, mode: "insensitive" as const } }),
    ...(active !== undefined && { active }),
  };

  const total = await prisma.tokenAlert.count({ where });

  const data = await prisma.tokenAlert.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      [sortBy]: order,
    },
  });

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data,
  };
}

export async function createTokenAlertService(
  userId: string,
  data: {
    symbol: string;
    price: number;
    direction: "CROSS_UP" | "CROSS_DOWN";
  }
) {
  // Verificar se já existe um alerta ativo para o mesmo símbolo e preço
  const existingAlert = await prisma.tokenAlert.findFirst({
    where: {
      symbol: data.symbol,
      price: data.price,
      direction: data.direction,
      userId,
      active: true,
    },
  });

  if (existingAlert) {
    throw new UnauthorizedError(MESSAGES.TOKEN_ALERT.ALREADY_EXISTS);
  }

  const tokenAlert = await prisma.tokenAlert.create({
    data: {
      symbol: data.symbol,
      price: data.price,
      direction: data.direction,
      userId,
    },
  });

  return tokenAlert;
}

export async function getTokenAlertService(userId: string, id: string) {
  const tokenAlert = await prisma.tokenAlert.findFirst({
    where: { id, userId },
  });

  if (!tokenAlert) {
    throw new NotFoundError(MESSAGES.TOKEN_ALERT.NOT_FOUND);
  }

  return tokenAlert;
}

export async function updateTokenAlertService(
  id: string,
  userId: string,
  data: {
    symbol?: string;
    price?: number;
    direction?: "CROSS_UP" | "CROSS_DOWN";
    active?: boolean;
  }
) {
  const tokenAlert = await prisma.tokenAlert.findFirst({
    where: { id, userId },
  });

  if (!tokenAlert) {
    throw new NotFoundError(MESSAGES.TOKEN_ALERT.NOT_FOUND);
  }

  // Se estiver atualizando símbolo, preço ou direção, verificar se não existe outro alerta ativo
  if (data.symbol || data.price || data.direction) {
    const existingAlert = await prisma.tokenAlert.findFirst({
      where: {
        symbol: data.symbol || tokenAlert.symbol,
        price: data.price || tokenAlert.price,
        direction: data.direction || tokenAlert.direction,
        userId,
        active: true,
        NOT: { id },
      },
    });

    if (existingAlert) {
      throw new ForbiddenError(MESSAGES.TOKEN_ALERT.ALREADY_EXISTS);
    }
  }

  return prisma.tokenAlert.update({
    where: { id },
    data,
  });
}

export async function deleteTokenAlertService(id: string, userId: string) {
  const tokenAlert = await prisma.tokenAlert.findFirst({
    where: { id, userId },
  });

  if (!tokenAlert) {
    throw new NotFoundError(MESSAGES.TOKEN_ALERT.NOT_FOUND);
  }

  return prisma.tokenAlert.delete({
    where: { id },
  });
}

export async function activateTokenAlertService(id: string, userId: string) {
  const tokenAlert = await prisma.tokenAlert.findFirst({
    where: { id, userId },
  });

  if (!tokenAlert) {
    throw new NotFoundError(MESSAGES.TOKEN_ALERT.NOT_FOUND);
  }

  if (tokenAlert.active) {
    throw new ForbiddenError(MESSAGES.TOKEN_ALERT.ALREADY_ACTIVE);
  }

  // Verificar se não existe outro alerta ativo para o mesmo símbolo, preço e direção
  const existingAlert = await prisma.tokenAlert.findFirst({
    where: {
      symbol: tokenAlert.symbol,
      price: tokenAlert.price,
      direction: tokenAlert.direction,
      userId,
      active: true,
      NOT: { id },
    },
  });

  if (existingAlert) {
    throw new ForbiddenError(MESSAGES.TOKEN_ALERT.ALREADY_EXISTS);
  }

  return prisma.tokenAlert.update({
    where: { id },
    data: { active: true },
  });
}

export async function deactivateTokenAlertService(id: string, userId: string) {
  const tokenAlert = await prisma.tokenAlert.findFirst({
    where: { id, userId },
  });

  if (!tokenAlert) {
    throw new NotFoundError(MESSAGES.TOKEN_ALERT.NOT_FOUND);
  }

  if (!tokenAlert.active) {
    throw new ForbiddenError(MESSAGES.TOKEN_ALERT.ALREADY_INACTIVE);
  }

  return prisma.tokenAlert.update({
    where: { id },
    data: { active: false },
  });
}

export async function updateLastNotificationDateService(
  id: string,
  userId: string
) {
  const tokenAlert = await prisma.tokenAlert.findFirst({
    where: { id, userId },
  });

  if (!tokenAlert) {
    throw new NotFoundError(MESSAGES.TOKEN_ALERT.NOT_FOUND);
  }

  return prisma.tokenAlert.update({
    where: { id },
    data: { lastNotificationDate: new Date() },
  });
}
