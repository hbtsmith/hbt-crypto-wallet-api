import { readFileSync, unlinkSync } from "fs";
import { join } from "path";
import { prisma } from "../src/config/prisma";

export async function customTeardown() {
  const tempFile = join(__dirname, ".temp-db-name");

  let dbName: string | null = null;
  try {
    dbName = readFileSync(tempFile, "utf-8").trim();
    unlinkSync(tempFile); // remove o arquivo temporário
  } catch (error) {
    console.error("Erro ao ler o nome do banco de testes:", error);
  }

  if (dbName) {
    try {
      await prisma.$executeRawUnsafe(
        `DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE);`
      );
      console.log(`Banco de dados "${dbName}" excluído com sucesso.`);
    } catch (error) {
      console.error(`Erro ao excluir o banco "${dbName}":`, error);
    }
  }

  await prisma.$disconnect();
}
