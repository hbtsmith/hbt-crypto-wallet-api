import { prisma } from "../config/prisma";
import { MESSAGES } from "../messages";

export async function listTokenService(
  userId: string,
  params: {
    name?: string;
    symbol?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: "asc" | "desc";
  }
) {
  const {
    name = "",
    symbol = "",
    page = 1,
    limit = 10,
    sortBy = "name",
    order = "asc",
  } = params;

  const where: any = {
    userId,
    ...(name && { name: { contains: name, mode: "insensitive" as const } }),
    ...(symbol && {
      symbol: { contains: symbol, mode: "insensitive" as const },
    }),
  };

  const total = await prisma.token.count({ where });

  const data = await prisma.token.findMany({
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

export async function createTokenService(
  userId: string,
  data: {
    name: string;
    symbol: string;
    categoryId: string;
  }
) {
  const category = await prisma.category.findFirst({
    where: { id: data.categoryId, userId },
  });

  if (!category) {
    throw new Error(MESSAGES.CATEGORY.NOT_FOUND);
  }

  const tokenExists = await prisma.token.findFirst({
    where: { symbol: data.symbol, userId },
  });

  if (tokenExists) {
    throw new Error(MESSAGES.TOKEN.ALREADY_EXISTS);
  }

  const token = await prisma.token.create({
    data: {
      name: data.name,
      symbol: data.symbol,
      categoryId: data.categoryId,
      userId,
    },
  });

  return {
    ...token,
    balances: [],
  };
}

export async function getTokenService(userId: string, id: string) {
  const token = await prisma.token.findFirst({
    where: { id, userId },
    include: { balances: true },
  });
  if (!token) {
    throw new Error(MESSAGES.TOKEN.NOT_FOUND);
  }
  return token;
}

export async function updateTokenService(
  id: string,
  userId: string,
  data: {
    name?: string;
    symbol?: string;
    categoryId?: string;
  }
) {
  const token = await prisma.token.findFirst({
    where: { id, userId },
  });

  if (!token) {
    throw new Error(MESSAGES.TOKEN.NOT_FOUND);
  }

  if (data.symbol && data.symbol !== token.symbol) {
    const symbolExists = await prisma.token.findFirst({
      where: {
        symbol: data.symbol,
        userId,
        NOT: { id },
      },
    });
    if (symbolExists) {
      throw new Error(MESSAGES.TOKEN.ALREADY_EXISTS);
    }
  }

  if (data.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, userId },
    });
    if (!category) {
      throw new Error(MESSAGES.CATEGORY.NOT_FOUND);
    }
  }

  return prisma.token.update({
    where: { id },
    data,
    include: { balances: true },
  });
}

export async function deleteTokenService(id: string, userId: string) {
  const tokenDelete = await prisma.token.findFirst({
    where: { id, userId },
  });

  if (!tokenDelete) {
    throw new Error(MESSAGES.TOKEN.NOT_FOUND);
  }

  return prisma.token.delete({
    where: { id },
  });
}
