import { prisma } from "../config/prisma";
import { NotFoundError, ForbiddenError } from "../helpers/api-errors";
import { operationTypeEnum } from "../helpers/api-consts-enum";
import { MESSAGES } from "../messages";

export async function createTokenBalanceService(
  userId: string,
  tokenId: string,
  data: any
) {
  const token = await prisma.token.findFirst({
    where: { id: tokenId, userId },
  });

  if (!token) throw new NotFoundError(MESSAGES.TOKEN.NOT_FOUND);

  const tokenBalanceSum = await prisma.tokenBalance.aggregate({
    where: { tokenId },
    _sum: { amount: true },
  });

  const isOpSell = data.operationType == operationTypeEnum.SELL;
  const actualBalance = tokenBalanceSum._sum.amount ?? 0;

  if (isOpSell) {
    if (actualBalance < data.amount) {
      throw new ForbiddenError(
        MESSAGES.TOKEN_BALANCE.INSUFFICIENT_FUNDS_TO_SELL
      );
    }

    data.amount = -data.amount;
  }

  const tokenBalance = await prisma.tokenBalance.create({
    data: {
      ...data,
      notes: data.notes ?? null,
    },
  });

  return tokenBalance;
}

export async function listTokenBalanceService(
  userId: string,
  tokenId: string,
  params: {
    page: number;
    limit: number;
    sortBy: string;
    order: "asc" | "desc";
  }
) {
  const token = await prisma.token.findFirst({
    where: { id: tokenId, userId },
  });

  if (!token) throw new NotFoundError(MESSAGES.TOKEN.NOT_FOUND);

  const {
    page = 1,
    limit = 10,
    sortBy = "operationAt",
    order = "asc",
  } = params;

  const where: any = {
    tokenId,
  };

  const total = await prisma.tokenBalance.count({ where });

  const data = await prisma.tokenBalance.findMany({
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

export async function getTokenBalanceService(
  userId: string,
  balanceId: string
) {
  const tokenBalance = await prisma.tokenBalance.findFirst({
    where: { id: balanceId },
  });

  if (!tokenBalance) throw new NotFoundError(MESSAGES.TOKEN_BALANCE.NOT_FOUND);

  const token = await prisma.token.findFirst({
    where: { id: tokenBalance.tokenId, userId },
  });

  if (!token) throw new NotFoundError(MESSAGES.TOKEN.NOT_FOUND);

  return tokenBalance;
}

export async function updateTokenBalanceService(
  userId: string,
  balanceId: string,
  data: any
) {
  const tokenBalance = await prisma.tokenBalance.findFirst({
    where: { id: balanceId },
  });

  if (!tokenBalance) throw new NotFoundError(MESSAGES.TOKEN_BALANCE.NOT_FOUND);

  const token = await prisma.token.findFirst({
    where: { id: tokenBalance.tokenId, userId },
  });

  if (!token) throw new NotFoundError(MESSAGES.TOKEN.NOT_FOUND);

  const updatedTokenBalance = await prisma.tokenBalance.update({
    where: { id: balanceId },
    data: {
      ...data,
      notes: data.notes ?? null,
    },
  });

  return updatedTokenBalance;
}

export async function deleteTokenBalanceService(
  userId: string,
  balanceId: string
) {
  const tokenBalance = await prisma.tokenBalance.findFirst({
    where: { id: balanceId },
  });

  if (!tokenBalance) throw new NotFoundError(MESSAGES.TOKEN_BALANCE.NOT_FOUND);

  const token = await prisma.token.findFirst({
    where: { id: tokenBalance.tokenId, userId },
  });

  if (!token) throw new NotFoundError(MESSAGES.TOKEN.NOT_FOUND);

  await prisma.tokenBalance.delete({
    where: { id: balanceId },
  });
}

export async function getTotalAmountBalanceService(
  userId: string,
  tokenId: string
) {
  const token = await prisma.token.findFirst({
    where: { id: tokenId, userId },
  });

  if (!token) throw new NotFoundError(MESSAGES.TOKEN.NOT_FOUND);

  const tokenBalanceSum = await prisma.tokenBalance.aggregate({
    where: { tokenId },
    _sum: { amount: true },
  });

  return tokenBalanceSum._sum.amount;
}

export async function getTotalValueBalanceService(
  userId: string,
  tokenId: string
) {
  const token = await prisma.token.findFirst({
    where: { id: tokenId, userId },
  });

  if (!token) throw new NotFoundError(MESSAGES.TOKEN.NOT_FOUND);

  const balances = await prisma.tokenBalance.findMany({ where: { tokenId } });

  const total = balances.reduce((sum, b) => {
    const amount =
      typeof b.amount === "object" && "toNumber" in b.amount
        ? b.amount.toNumber()
        : Number(b.amount);
    const price =
      typeof b.price === "object" && "toNumber" in b.price
        ? b.price.toNumber()
        : Number(b.price);

    let value = Math.abs(amount * price);
    if (b.operationType === "BUY") {
      value = -value;
    }

    return sum + value;
  }, 0);
  return total;
}
