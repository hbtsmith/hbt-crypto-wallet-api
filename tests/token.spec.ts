import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/prisma";
import { generateTestToken } from "./utils/generateTestToken";

let token: string;
let categoryId: string;

async function generateTestTokenAndCategory(): Promise<
  { token: string; categoryId: string } | { token: string; categoryId: string }
> {
  const token = await generateTestToken();

  // Cria categoria de teste
  const response = await request(app)
    .post("/categories")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Network",
      description: "Category for project/tokens of Network",
    });

  const categoryId = response.body.id;

  return { token, categoryId };

  //   throw new Error("Function not implemented.");
}

beforeAll(async () => {
  // Cria usuário de teste
  ({ token, categoryId } = await generateTestTokenAndCategory());
});

afterAll(async () => {
  // Cleanup: remove tokens, categorias e usuários
  await prisma.token.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});

describe("Token", () => {
  it("Should create a new token linked to the category", async () => {
    ({ token, categoryId } = await generateTestTokenAndCategory());

    const response = await request(app)
      .post("/tokens")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Bitcoin",
        symbol: "BTC",
        categoryId: categoryId,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("Bitcoin");
    expect(response.body.symbol).toBe("BTC");
  });

  it("Should fail to create a token with invalid categoryId", async () => {
    ({ token, categoryId } = await generateTestTokenAndCategory());

    const response = await request(app)
      .post("/tokens")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "InvalidToken",
        symbol: "INV",
        categoryId: "nonexistent-category-id",
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it.only("Should list tokens from logged user", async () => {
    ({ token, categoryId } = await generateTestTokenAndCategory());

    const response = await request(app)
      .get("/tokens")
      .set("Authorization", `Bearer ${token}`);
    console.log("##########", response.body);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("total");
    expect(response.body).toHaveProperty("page");
    expect(response.body).toHaveProperty("limit");
    expect(response.body).toHaveProperty("totalPages");
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
