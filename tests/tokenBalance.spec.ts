import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/prisma";
import { generateTestToken } from "./utils/generateTestToken";
import { operationTypeEnum } from "../src/helpers/api-consts-enum";
import { MESSAGES } from "../src/messages";

/**
 * Objective here is not to cover 100% of the code, but to understand the dynamics of unit testing and API interactions.
 */

let authToken: string;
let categoryId: string;
let tokenId: string;

async function generateTestTokenAndCategory(): Promise<
  | { authToken: string; categoryId: string; tokenId: string }
  | { authToken: string; categoryId: string; tokenId: string }
> {
  const authToken = await generateTestToken();

  // Cria categoria de teste
  const responseCategory = await request(app)
    .post("/categories")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      name: "Network",
      description: "Category for project/tokens of Network",
    });

  const categoryId = responseCategory.body.id;

  const responseToken = await request(app)
    .post("/tokens")
    .set("Authorization", `Bearer ${authToken}`)
    .send({
      name: "Bitcoin",
      symbol: "BTC",
      categoryId: categoryId,
    });

  const tokenId = responseToken.body.id;

  return { authToken, categoryId, tokenId };
}

beforeAll(async () => {
  // Cria usuário de teste
  ({ authToken, categoryId, tokenId } = await generateTestTokenAndCategory());
});

afterAll(async () => {
  await prisma.tokenBalance.deleteMany();
  await prisma.token.deleteMany();
  await prisma.category.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

describe("Token", () => {
  it("Should create a positive token balance for a user token successfully", async () => {
    ({ authToken, categoryId, tokenId } = await generateTestTokenAndCategory());

    let price: number;
    let amount: number;

    price = 112452.54;
    amount = 0.01729;
    const response = await request(app)
      .post("/token-balance")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        tokenId,
        price,
        amount,
        operationType: operationTypeEnum.BUY,
        operationAt: new Date().toISOString(),
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(Number(response.body.price)).toBe(price);
    expect(Number(response.body.amount)).toBe(amount);
    expect(response.body.operationType).toBe(operationTypeEnum.BUY);
  });

  it("Should create a negative token balance for a user token successfully", async () => {
    ({ authToken, categoryId, tokenId } = await generateTestTokenAndCategory());

    let price: number;
    let amount: number;

    price = 112452.54;
    amount = 0.01729;
    const responseBuy = await request(app)
      .post("/token-balance")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        tokenId,
        price,
        amount,
        operationType: operationTypeEnum.BUY,
        operationAt: new Date().toISOString(),
      });

    expect(responseBuy.status).toBe(201);
    expect(responseBuy.body).toHaveProperty("id");
    expect(Number(responseBuy.body.price)).toBe(price);
    expect(Number(responseBuy.body.amount)).toBe(amount);
    expect(responseBuy.body.operationType).toBe(operationTypeEnum.BUY);

    price = 121234.09;
    amount = 0.00812;

    const responseSell = await request(app)
      .post("/token-balance")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        tokenId,
        price,
        amount,
        operationType: operationTypeEnum.SELL,
        operationAt: new Date().toISOString(),
      });

    expect(responseSell.status).toBe(201);
    expect(responseSell.body).toHaveProperty("id");
    expect(Number(responseSell.body.price)).toBe(price);
    expect(Number(responseSell.body.amount)).toBe(-amount);
    expect(responseSell.body.operationType).toBe(operationTypeEnum.SELL);
  });

  it("Should fail to create a negative token balance for a user token", async () => {
    ({ authToken, categoryId, tokenId } = await generateTestTokenAndCategory());

    let price: number;
    let amount: number;

    price = 121234.09;
    amount = 0.01829;

    const responseSell = await request(app)
      .post("/token-balance")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        tokenId,
        price,
        amount,
        operationType: operationTypeEnum.SELL,
        operationAt: new Date().toISOString(),
      });

    expect(responseSell.status).toBe(403);
    expect(responseSell.body).toHaveProperty("error");

    const errorBody = JSON.parse(responseSell.error.text);
    expect(errorBody.error).toBe(
      MESSAGES.TOKEN_BALANCE.INSUFFICIENT_FUNDS_TO_SELL
    );
  });

  it("Should fail to create a token balance with invalid tokenId", async () => {
    ({ authToken, categoryId, tokenId } = await generateTestTokenAndCategory());

    let price: number;
    let amount: number;

    price = 112452.54;
    amount = 0.01729;
    const response = await request(app)
      .post("/token-balance")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        tokenId: "invalid-token-id",
        price,
        amount,
        operationType: operationTypeEnum.BUY,
        operationAt: new Date().toISOString(),
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    const errorBody = JSON.parse(response.error.text);
    expect(errorBody.error).toBe(
      MESSAGES.VALIDATION.REQUIRED_UUID_FIELD("tokenId")
    );
  });

  it("Should list token balance from logged user token", async () => {
    ({ authToken, categoryId, tokenId } = await generateTestTokenAndCategory());

    const response = await request(app)
      .get("/token-balance")
      .query({ tokenId })
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("total");
    expect(response.body).toHaveProperty("page");
    expect(response.body).toHaveProperty("limit");
    expect(response.body).toHaveProperty("totalPages");
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("Should delete a token successfully", async () => {
    ({ authToken, categoryId, tokenId } = await generateTestTokenAndCategory());

    let price: number;
    let amount: number;

    price = 112452.54;
    amount = 0.01729;
    const response = await request(app)
      .post("/token-balance")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        tokenId,
        price,
        amount,
        operationType: operationTypeEnum.BUY,
        operationAt: new Date().toISOString(),
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(Number(response.body.price)).toBe(price);
    expect(Number(response.body.amount)).toBe(amount);
    expect(response.body.operationType).toBe(operationTypeEnum.BUY);

    const responseDelete = await request(app)
      .delete(`/token-balance/${response.body.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send();

    expect(responseDelete.status).toBe(204);
  });
});
