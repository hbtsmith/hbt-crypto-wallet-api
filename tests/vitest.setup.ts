import dotenv from "dotenv";
import { resolve } from "path";

// Força o carregamento do .env.test
dotenv.config({ path: resolve(__dirname, ".env.test"), override: true });

import { PrismaClient } from "@prisma/client";
import { beforeAll, afterAll, beforeEach } from "vitest";

export const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.tokenBalance.deleteMany({});
  await prisma.token.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});
