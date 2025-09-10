import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/prisma";
import { generateTestToken } from "./utils/generateTestToken";

/**
 * Objective here is not to cover 100% of the code, but to understand the dynamics of unit testing and API interactions.
 */

let authToken: string;
let categoryId: string;

async function generateTestTokenAndCategory(): Promise<
  | { authToken: string; categoryId: string }
  | { authToken: string; categoryId: string }
> {
  const authToken = await generateTestToken();

  // Cria categoria de teste
  const response = await request(app)
    .post("/categories")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      name: "Network",
      description: "Category for project/tokens of Network",
    });

  const categoryId = response.body.id;

  return { authToken, categoryId };
}

beforeAll(async () => {
  ({ authToken, categoryId } = await generateTestTokenAndCategory());
});

afterAll(async () => {
  await prisma.token.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});

describe("Token", () => {
  it("Should create a new token linked to the category", async () => {
    ({ authToken, categoryId } = await generateTestTokenAndCategory());

    const response = await request(app)
      .post("/tokens")
      .set("Authorization", `Bearer ${authToken}`)
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
    ({ authToken, categoryId } = await generateTestTokenAndCategory());

    const response = await request(app)
      .post("/tokens")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "InvalidToken",
        symbol: "INV",
        categoryId: "nonexistent-category-id",
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("Should list tokens from logged user", async () => {
    ({ authToken, categoryId } = await generateTestTokenAndCategory());

    const response = await request(app)
      .get("/tokens")
      .set("Authorization", `Bearer ${authToken}`);
    console.log("##########", response.body);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("total");
    expect(response.body).toHaveProperty("page");
    expect(response.body).toHaveProperty("limit");
    expect(response.body).toHaveProperty("totalPages");
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("Should update a token successfully", async () => {
    ({ authToken, categoryId } = await generateTestTokenAndCategory());

    const responseCreate = await request(app)
      .post("/tokens")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Bitcoin",
        symbol: "BTC",
        categoryId: categoryId,
      });

    expect(responseCreate.status).toBe(201);
    expect(responseCreate.body).toHaveProperty("id");
    expect(responseCreate.body.name).toBe("Bitcoin");
    expect(responseCreate.body.symbol).toBe("BTC");

    const responseUpdate = await request(app)
      .put(`/tokens/${responseCreate.body.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "SOLANA",
        symbol: "SOL",
        categoryId: categoryId,
      });

    expect(responseUpdate.status).toBe(200);
    expect(responseUpdate.body).toHaveProperty("id");
    expect(responseUpdate.body.name).toBe("SOLANA");
    expect(responseUpdate.body.symbol).toBe("SOL");
  });

  it("Should delete a token successfully", async () => {
    ({ authToken, categoryId } = await generateTestTokenAndCategory());

    const responseCreate = await request(app)
      .post("/tokens")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Bitcoin",
        symbol: "BTC",
        categoryId: categoryId,
      });

    expect(responseCreate.status).toBe(201);
    expect(responseCreate.body).toHaveProperty("id");
    expect(responseCreate.body.name).toBe("Bitcoin");
    expect(responseCreate.body.symbol).toBe("BTC");

    const responseDelete = await request(app)
      .delete(`/tokens/${responseCreate.body.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send();

    expect(responseDelete.status).toBe(204);
  });
});
