import request from "supertest";
import { beforeAll, afterAll, describe, it, expect, beforeEach } from "vitest";
import app from "../src/app";
import { prisma } from "../src/config/prisma";
import { generateTestToken } from "./utils/generateTestToken";
import { MESSAGES } from "../src/messages";

/**
 * Testes para funcionalidades de Token Alerts
 * Seguindo o mesmo padrão dos testes de categoria e import
 */

let token: string;
let userId: string;
let createdTokenAlert: any;
let createdTokenAlertId: string;

beforeAll(async () => {
  // Criar usuário e obter token
  token = await generateTestToken();
});

afterAll(async () => {
  // Limpar dados de teste
  await prisma.tokenAlert.deleteMany();
  await prisma.tokenBalance.deleteMany();
  await prisma.token.deleteMany();
  await prisma.category.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

beforeEach(async () => {
  token = await generateTestToken();
});

describe("Token Alerts Features", () => {
  describe("Create Token Alert", () => {
    it("Should create a new token alert successfully", async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "BTC",
          price: 50000.00,
          direction: "CROSS_UP"
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.symbol).toBe("BTC");
      expect(response.body.price).toBe("50000");
      expect(response.body.direction).toBe("CROSS_UP");
      expect(response.body.active).toBe(true);
      expect(response.body).toHaveProperty("createdAt");
      expect(response.body).toHaveProperty("updatedAt");

      createdTokenAlert = response.body;
      createdTokenAlertId = response.body.id;
    });

    it("Should create a token alert with CROSS_DOWN direction", async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "ETH",
          price: 3000.00,
          direction: "CROSS_DOWN"
        });

      expect(response.status).toBe(201);
      expect(response.body.direction).toBe("CROSS_DOWN");
      expect(response.body.symbol).toBe("ETH");
      expect(response.body.price).toBe("3000");
    });

    it("Should return error when creating alert without symbol", async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          price: 50000.00,
          direction: "CROSS_UP"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.VALIDATION.REQUIRED_FIELD("symbol"));
    });

    it("Should return error when creating alert without price", async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "BTC",
          direction: "CROSS_UP"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_ALERT.INVALID_PRICE);
    });

    it("Should return error when creating alert without direction", async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "BTC",
          price: 50000.00
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.VALIDATION.REQUIRED_FIELD("direction"));
    });

    it("Should return error when price is negative", async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "BTC",
          price: -1000.00,
          direction: "CROSS_UP"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_ALERT.INVALID_PRICE);
    });

    it("Should return error when price is zero", async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "BTC",
          price: 0,
          direction: "CROSS_UP"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_ALERT.INVALID_PRICE);
    });

    it("Should return error when direction is invalid", async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "BTC",
          price: 50000.00,
          direction: "INVALID_DIRECTION"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_ALERT.INVALID_DIRECTION);
    });

    it("Should return error when creating duplicate alert", async () => {
      // Criar primeiro alerta
      await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "BTC",
          price: 50000.00,
          direction: "CROSS_UP"
        });

      // Tentar criar alerta duplicado
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "BTC",
          price: 50000.00,
          direction: "CROSS_UP"
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_ALERT.ALREADY_EXISTS);
    });
  });

  describe("List Token Alerts", () => {
    beforeEach(async () => {
      // Criar alguns alertas para teste
      await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "BTC",
          price: 50000.00,
          direction: "CROSS_UP"
        });

      await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "ETH",
          price: 3000.00,
          direction: "CROSS_DOWN"
        });

      await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "SOL",
          price: 100.00,
          direction: "CROSS_UP"
        });
    });

    it("Should list all token alerts", async () => {
      const response = await request(app)
        .get("/token-alerts")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("page");
      expect(response.body).toHaveProperty("limit");
      expect(response.body).toHaveProperty("totalPages");
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);
    });

    it("Should list token alerts with pagination", async () => {
      const response = await request(app)
        .get("/token-alerts?page=1&limit=2")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(2);
      expect(response.body.data.length).toBe(2);
    });

    it("Should filter token alerts by symbol", async () => {
      const response = await request(app)
        .get("/token-alerts?symbol=BTC")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].symbol).toBe("BTC");
    });

    it("Should filter token alerts by active status", async () => {
      const response = await request(app)
        .get("/token-alerts?active=true")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.every((alert: any) => alert.active === true)).toBe(true);
    });

    it("Should sort token alerts by creation date", async () => {
      const response = await request(app)
        .get("/token-alerts?sortBy=createdAt&order=desc")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("Get Token Alert by ID", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "BTC",
          price: 50000.00,
          direction: "CROSS_UP"
        });

      createdTokenAlertId = response.body.id;
    });

    it("Should get token alert by ID successfully", async () => {
      const response = await request(app)
        .get(`/token-alerts/${createdTokenAlertId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdTokenAlertId);
      expect(response.body.symbol).toBe("BTC");
      expect(response.body.price).toBe("50000");
      expect(response.body.direction).toBe("CROSS_UP");
    });

    it("Should return error when token alert not found", async () => {
      const fakeId = "12345678-1234-4123-8123-123456789abc";
      const response = await request(app)
        .get(`/token-alerts/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_ALERT.NOT_FOUND);
    });

    it("Should return error when ID is invalid", async () => {
      const response = await request(app)
        .get("/token-alerts/invalid-id")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_ALERT.INVALID_ID);
    });
  });

  describe("Update Token Alert", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "BTC",
          price: 50000.00,
          direction: "CROSS_UP"
        });

      createdTokenAlertId = response.body.id;
    });

    it("Should update token alert successfully", async () => {
      const response = await request(app)
        .put(`/token-alerts/${createdTokenAlertId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "ETH",
          price: 3000.00,
          direction: "CROSS_DOWN"
        });

      expect(response.status).toBe(200);
      expect(response.body.symbol).toBe("ETH");
      expect(response.body.price).toBe("3000");
      expect(response.body.direction).toBe("CROSS_DOWN");
    });

    it("Should update only symbol", async () => {
      const response = await request(app)
        .put(`/token-alerts/${createdTokenAlertId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "LTC"
        });

      expect(response.status).toBe(200);
      expect(response.body.symbol).toBe("LTC");
      expect(response.body.price).toBe("50000"); // Deve manter o valor original
      expect(response.body.direction).toBe("CROSS_UP"); // Deve manter o valor original
    });

    it("Should update only price", async () => {
      const response = await request(app)
        .put(`/token-alerts/${createdTokenAlertId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          price: 60000.00
        });

      expect(response.status).toBe(200);
      expect(response.body.price).toBe("60000");
      expect(response.body.symbol).toBe("BTC"); // Deve manter o valor original
    });

    it("Should update only direction", async () => {
      const response = await request(app)
        .put(`/token-alerts/${createdTokenAlertId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          direction: "CROSS_DOWN"
        });

      expect(response.status).toBe(200);
      expect(response.body.direction).toBe("CROSS_DOWN");
      expect(response.body.symbol).toBe("BTC"); // Deve manter o valor original
    });

    it("Should return error when updating with invalid price", async () => {
      const response = await request(app)
        .put(`/token-alerts/${createdTokenAlertId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          price: -1000.00
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_ALERT.INVALID_PRICE);
    });

    it("Should return error when updating with invalid direction", async () => {
      const response = await request(app)
        .put(`/token-alerts/${createdTokenAlertId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          direction: "INVALID"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_ALERT.INVALID_DIRECTION);
    });

    it("Should return error when token alert not found", async () => {
      const fakeId = "12345678-1234-4123-8123-123456789abc";
      const response = await request(app)
        .put(`/token-alerts/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "ETH"
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_ALERT.NOT_FOUND);
    });
  });

  describe("Delete Token Alert", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "BTC",
          price: 50000.00,
          direction: "CROSS_UP"
        });

      createdTokenAlertId = response.body.id;
    });

    it("Should delete token alert successfully", async () => {
      const response = await request(app)
        .delete(`/token-alerts/${createdTokenAlertId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(204);

      // Verificar se foi deletado
      const getResponse = await request(app)
        .get(`/token-alerts/${createdTokenAlertId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(getResponse.status).toBe(404);
    });

    it("Should return error when token alert not found", async () => {
      const fakeId = "12345678-1234-4123-8123-123456789abc";
      const response = await request(app)
        .delete(`/token-alerts/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_ALERT.NOT_FOUND);
    });

    it("Should return error when ID is invalid", async () => {
      const response = await request(app)
        .delete("/token-alerts/invalid-id")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_ALERT.INVALID_ID);
    });
  });

  describe("Activate Token Alert", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "BTC",
          price: 50000.00,
          direction: "CROSS_UP"
        });

      createdTokenAlertId = response.body.id;

      // Desativar o alerta primeiro
      await request(app)
        .patch(`/token-alerts/${createdTokenAlertId}/deactivate`)
        .set("Authorization", `Bearer ${token}`);
    });

    it("Should activate token alert successfully", async () => {
      const response = await request(app)
        .patch(`/token-alerts/${createdTokenAlertId}/activate`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe(MESSAGES.TOKEN_ALERT.ACTIVATED_SUCCESS);
      expect(response.body.data.active).toBe(true);
    });

    it("Should return error when trying to activate already active alert", async () => {
      // Ativar o alerta primeiro
      await request(app)
        .patch(`/token-alerts/${createdTokenAlertId}/activate`)
        .set("Authorization", `Bearer ${token}`);

      // Tentar ativar novamente
      const response = await request(app)
        .patch(`/token-alerts/${createdTokenAlertId}/activate`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_ALERT.ALREADY_ACTIVE);
    });

    it("Should return error when token alert not found", async () => {
      const fakeId = "12345678-1234-4123-8123-123456789abc";
      const response = await request(app)
        .patch(`/token-alerts/${fakeId}/activate`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_ALERT.NOT_FOUND);
    });
  });

  describe("Deactivate Token Alert", () => {
    beforeEach(async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "BTC",
          price: 50000.00,
          direction: "CROSS_UP"
        });

      createdTokenAlertId = response.body.id;
    });

    it("Should deactivate token alert successfully", async () => {
      const response = await request(app)
        .patch(`/token-alerts/${createdTokenAlertId}/deactivate`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe(MESSAGES.TOKEN_ALERT.DEACTIVATED_SUCCESS);
      expect(response.body.data.active).toBe(false);
    });

    it("Should return error when trying to deactivate already inactive alert", async () => {
      // Desativar o alerta primeiro
      await request(app)
        .patch(`/token-alerts/${createdTokenAlertId}/deactivate`)
        .set("Authorization", `Bearer ${token}`);

      // Tentar desativar novamente
      const response = await request(app)
        .patch(`/token-alerts/${createdTokenAlertId}/deactivate`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_ALERT.ALREADY_INACTIVE);
    });

    it("Should return error when token alert not found", async () => {
      const fakeId = "12345678-1234-4123-8123-123456789abc";
      const response = await request(app)
        .patch(`/token-alerts/${fakeId}/deactivate`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_ALERT.NOT_FOUND);
    });
  });

  describe("Authentication", () => {
    it("Should reject request without authentication", async () => {
      const response = await request(app)
        .post("/token-alerts")
        .send({
          symbol: "BTC",
          price: 50000.00,
          direction: "CROSS_UP"
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("Should reject request with invalid token", async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", "Bearer invalid-token")
        .send({
          symbol: "BTC",
          price: 50000.00,
          direction: "CROSS_UP"
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("Edge Cases", () => {
    it("Should handle very large price values", async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "BTC",
          price: 999999999.99,
          direction: "CROSS_UP"
        });

      expect(response.status).toBe(201);
      expect(response.body.price).toBe("999999999.99");
    });

    it("Should handle very small price values", async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "DOGE",
          price: 0.000001,
          direction: "CROSS_UP"
        });

      expect(response.status).toBe(201);
      expect(response.body.price).toBe("0.000001");
    });

    it("Should handle symbols with special characters", async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "BTC-USD",
          price: 50000.00,
          direction: "CROSS_UP"
        });

      expect(response.status).toBe(201);
      expect(response.body.symbol).toBe("BTC-USD");
    });

    it("Should handle empty symbol string", async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "",
          price: 50000.00,
          direction: "CROSS_UP"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("Should handle whitespace-only symbol", async () => {
      const response = await request(app)
        .post("/token-alerts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          symbol: "   ",
          price: 50000.00,
          direction: "CROSS_UP"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });
});
