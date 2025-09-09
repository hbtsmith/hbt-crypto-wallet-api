import { prisma } from "../config/prisma";

import { NotFoundError } from "../helpers/api-errors";
import { MESSAGES } from "../messages";

export async function listCategoriesService(
  params: {
    name?: string;
    description?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: "asc" | "desc";
  },
  userId: string
) {
  const user = await prisma.user.findFirst({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError(MESSAGES.USER.NOT_FOUND);
  }

  const {
    name = "",
    description = "",
    page = 1,
    limit = 10,
    sortBy = "name",
    order = "asc",
  } = params;

  const where: any = {
    userId,
    ...(name && { name: { contains: name, mode: "insensitive" as const } }),
    ...(description && {
      description: { contains: description, mode: "insensitive" as const },
    }),
  };

  const total = await prisma.category.count({ where });

  const data = await prisma.category.findMany({
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

export async function createNewCategory(
  data: { name: string; description?: string },
  userId: string
) {
  const user = await prisma.user.findFirst({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError(MESSAGES.USER.NOT_FOUND);
  }

  return prisma.category.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      userId,
    },
  });
}

export async function updateCategoryById(
  data: { id: string; name: string; description: string },
  userId: string
) {
  const user = await prisma.user.findFirst({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError(MESSAGES.USER.NOT_FOUND);
  }

  return prisma.category.update({
    where: {
      id: data.id,
      userId,
    },
    data: {
      name: data.name,
      description: data.description ?? null,
    },
  });
}

export async function getCategoryById(id: string, userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError(MESSAGES.USER.NOT_FOUND);
  }

  return prisma.category.findFirst({
    where: { id, userId },
  });
}
