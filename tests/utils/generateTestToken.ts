import { prisma } from "../../src/config/prisma";
import { signAccessToken } from "../../src/utils/jwt";
import bcrypt from "bcryptjs";

export async function generateTestToken() {
  const password = await bcrypt.hash("123456", 10);

  const user = await prisma.user.create({
    data: {
      name: "Usuário de Teste",
      email: `testuser_${Date.now()}@mail.com`,
      password,
    },
  });

  const token = signAccessToken({ id: user.id });
  return token;
}
