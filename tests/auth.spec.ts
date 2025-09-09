// tests/auth.spec.ts
import request from "supertest";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import app from "../src/app";
import { prisma } from "./vitest.setup";
import { MESSAGES } from "../src/messages";

beforeEach(async () => {
  await prisma.user.deleteMany();
});

describe("Auth", () => {
  it("Should fail with invalid credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "invalido@mail.com", password: "123456" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(MESSAGES.USER.INVALID_CREDENTIALS);
  });

  it("Should register a new user successfully", async () => {
    const response = await request(app).post("/auth/register").send({
      name: "Herbert Test",
      email: "herbert.test@email.com",
      password: "123456",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toMatchObject({
      email: "herbert.test@email.com",
    });

    const userInDb = await prisma.user.findUnique({
      where: { email: "herbert.test@email.com" },
    });

    expect(userInDb).not.toBeNull();
    expect(userInDb?.name).toBe("Herbert Test");
  });

  it("Should fail on trying to register an existing user", async () => {
    const responseSuccess = await request(app).post("/auth/register").send({
      name: "Herbert Test",
      email: "herbert.test@email.com",
      password: "123456",
    });

    expect(responseSuccess.status).toBe(201);

    const responseFail = await request(app).post("/auth/register").send({
      name: "Herbert Test",
      email: "herbert.test@email.com",
      password: "123456",
    });

    expect(responseFail.status).toBe(401);
    expect(responseFail.body).toHaveProperty("error");
    expect(responseFail.body.error).toBe(MESSAGES.USER.ALREADY_REGISTERED);
  });
});
