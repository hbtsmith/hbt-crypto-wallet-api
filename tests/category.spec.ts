import request from "supertest";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import app from "../src/app";
import { prisma } from "../src/config/prisma";
import { generateTestToken } from "./utils/generateTestToken";
/**
 * Objective here is not to cover 100% of the code, but to understand the dynamics of unit testing and API interactions.
 */

let token: string;

beforeAll(async () => {
  token = await generateTestToken();
});

afterAll(async () => {
  await prisma.tokenAlert.deleteMany();
  await prisma.tokenBalance.deleteMany();
  await prisma.token.deleteMany();
  await prisma.category.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

describe("Category", () => {
  it("Should create a new category successfully", async () => {
    token = await generateTestToken();

    const response = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Network",
        description: "Category for project/tokens of Network",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("Network");
  });

  it("Should return an error when creating a category without a name", async () => {
    token = await generateTestToken();

    const response = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        description: "No name",
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("Should list all categories", async () => {
    token = await generateTestToken();

    const responseCreate = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Network",
        description: "Category for project/tokens of Network",
      });

    expect(responseCreate.status).toBe(201);

    const responseList = await request(app)
      .get("/categories")
      .set("Authorization", `Bearer ${token}`);

    expect(responseList.status).toBe(200);
    expect(Array.isArray(responseList.body.data)).toBe(true);
  });

  it("Should edit a category successfully", async () => {
    token = await generateTestToken();

    const responseCreate = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Network",
        description: "Category for project/tokens of Network",
      });

    expect(responseCreate.status).toBe(201);

    const idCategory = responseCreate.body.id;

    const responseUpdate = await request(app)
      .put(`/categories/${idCategory}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "NetWork Changed",
        description: "Desc for changing category",
      });

    expect(responseUpdate.status).toBe(200);
    expect(responseUpdate.body).toHaveProperty("id");

    const responseGet = await request(app)
      .get(`/categories/${idCategory}`)
      .set("Authorization", `Bearer ${token}`);

    expect(responseGet.status).toBe(200);
    expect(responseGet.body).toHaveProperty("id", idCategory);
    expect(responseGet.body).toHaveProperty("name", "NetWork Changed");
    expect(responseGet.body).toHaveProperty(
      "description",
      "Desc for changing category"
    );
  });
});
