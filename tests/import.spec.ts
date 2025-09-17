import request from "supertest";
import { beforeAll, afterAll, describe, it, expect, beforeEach } from "vitest";
import app from "../src/app";
import { prisma } from "../src/config/prisma";
import { generateTestToken } from "./utils/generateTestToken";
import { MESSAGES } from "../src/messages";

/**
 * Testes para funcionalidades de importação
 * Seguindo o mesmo padrão dos testes de categoria
 */

let token: string;
let userId: string;
let createdCategory: any;
let createdCategoryId: string;
let createdTokenId: string;

beforeAll(async () => {
  // Criar usuário e obter token
  token = await generateTestToken();

});

afterAll(async () => {
  // Limpar dados de teste
  await prisma.tokenBalance.deleteMany();
  await prisma.token.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  

});

beforeEach(async () => {
    token = await generateTestToken();

    const responseCreateCategory = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Network",
        description: "Category for project/tokens of Network",
      });

      createdCategory = responseCreateCategory.body;
      createdCategoryId = responseCreateCategory.body.id;

      const responseCreateToken = await request(app)
      .post("/tokens")
      .set("Authorization", `Bearer ${token}`)
      .send({
        symbol: "BTC",
        name: "Category for project/tokens of Network",
        categoryId: createdCategoryId,
      });

      createdTokenId = responseCreateToken.body.id;

  });

describe("Import Features", () => {
  describe("File Validation", () => {
    it("Should reject request without file", async () => {
      const response = await request(app)
        .post("/import/categories")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });

    it("Should reject invalid file type", async () => {
      // Criar um arquivo de texto simples
      const invalidFile = Buffer.from("test content");
      
      const response = await request(app)
        .post("/import/categories")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", invalidFile, "test.txt");

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("error");
    });

    it("Should reject file that is too large", async () => {
      // Criar um arquivo CSV muito grande (6MB)
      const largeContent = "name,description\n".repeat(400000); // ~6MB
      const largeFile = Buffer.from(largeContent);
      
      const response = await request(app)
        .post("/import/categories")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", largeFile, "large.csv");

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Categories Import", () => {
    it("Should handle empty CSV file", async () => {
      const csvContent = `name,description`;

      const response = await request(app)
        .post("/import/categories")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(csvContent), "empty.csv");

      expect(response.status).toBe(200);
      expect(response.body.result.imported).toBe(0);
    });

    it("Should import categories successfully from CSV", async () => {
      const csvContent = `name,description
DeFi,Decentralized Finance
Gaming,Blockchain gaming
NFT,Non-Fungible Token`;

      const response = await request(app)
        .post("/import/categories")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(csvContent), "categories.csv");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("result");
      expect(response.body.result).toHaveProperty("message");
      expect(response.body.result).toHaveProperty("imported", 3);
      expect(response.body.result).toHaveProperty("categories");
      expect(Array.isArray(response.body.result.categories)).toBe(true);
    });

    it("Should skip rows with empty names", async () => {
      const csvContent = `name,description
DeFi,Decentralized Finance
,Empty name row
Gaming,Blockchain gaming`;

      const response = await request(app)
        .post("/import/categories")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(csvContent), "mixed.csv");

      expect(response.status).toBe(200);
      expect(response.body.result.imported).toBe(2); // Apenas 2 categorias válidas
    });

    it("Should update existing categories", async () => {
      
      
      const categoryName = 'Updated description';
      const csvContent = `name,description
${createdCategory.name},${categoryName}`;

      const response = await request(app)
        .post("/import/categories")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(csvContent), "update.csv");

      expect(response.status).toBe(200);
      expect(response.body.result.imported).toBe(1);

      // Verificar se a categoria foi atualizada
      const updatedCategory = await prisma.category.findUnique({
        where: { id: createdCategoryId },
      });

      expect(updatedCategory?.description).toBe(categoryName);
    });
  });

  describe("Authentication", () => {
    it("Should reject import without authentication", async () => {
      const csvContent = `name,description
Test,Test description`;

      const response = await request(app)
        .post("/import/categories")
        .attach("file", Buffer.from(csvContent), "test.csv");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("Should reject import with invalid token", async () => {
      const csvContent = `name,description
Test,Test description`;

      const response = await request(app)
        .post("/import/categories")
        .set("Authorization", "Bearer invalid-token")
        .attach("file", Buffer.from(csvContent), "test.csv");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("File Information in Response", () => {
    it("Should return file information in successful import", async () => {
      const csvContent = `name,description
Test Category,Test description`;

      const response = await request(app)
        .post("/import/categories")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(csvContent), "test.csv");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("file");
      expect(response.body.file).toHaveProperty("name", "test.csv");
      expect(response.body.file).toHaveProperty("size");
      expect(response.body.file).toHaveProperty("type", "text/csv");
    });
  });

  describe("Import Service Integration", () => {
    it("Should handle CSV with special characters", async () => {
      const csvContent = `name,description
Café & Co.,Café e companhia
Ação & Reação,Ação e reação
São Paulo,São Paulo tokens`;

      const response = await request(app)
        .post("/import/categories")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(csvContent, "utf-8"), "special.csv");

      expect(response.status).toBe(200);
      expect(response.body.result.imported).toBe(3);
    });

    it("Should handle CSV with extra whitespace", async () => {
      const csvContent = `name,description
  DeFi  ,  Decentralized Finance  
  Gaming  ,  Blockchain gaming  `;

      const response = await request(app)
        .post("/import/categories")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(csvContent), "whitespace.csv");

      expect(response.status).toBe(200);
      expect(response.body.result.imported).toBe(2);
    });
  });

  describe("Tokens Import", () => {
    it("Should handle empty CSV file", async () => {
      const csvContent = `name,description`;

      const response = await request(app)
        .post("/import/tokens")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(csvContent), "empty.csv");

      expect(response.status).toBe(200);
      expect(response.body.result.imported).toBe(0);
    });

    it("Should import tokens successfully from CSV", async () => {

    const responseCreateCategory = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Network",
        description: "Category for project/tokens of Network",
      });

      const categoryId = responseCreateCategory.body.id;

      const csvContent = `symbol,name,categoryId
BTC,BITCOIN,${categoryId}
ETH,Ethereum,${categoryId}
SOL,SOLANA,${categoryId}`;

      const response = await request(app)
        .post("/import/tokens")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(csvContent), "tokens.csv");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("result");
      expect(response.body.result).toHaveProperty("message");
      expect(response.body.result).toHaveProperty("imported", 3);
      expect(response.body.result).toHaveProperty("tokens");
      expect(Array.isArray(response.body.result.tokens)).toBe(true);
    });

    it("Should skip rows with empty names", async () => {
    
        const responseCreateCategory = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Network",
        description: "Category for project/tokens of Network",
      });

      const categoryId = responseCreateCategory.body.id;

      const csvContent = `symbol,name,categoryId
,BITCOIN,${categoryId}
ETH,,${categoryId}
SOL,SOLANA,
ATOM,COSMOS NETWORK,${categoryId}
AVAX,Avalanche Network Labs,${categoryId}`;

      const response = await request(app)
        .post("/import/tokens")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(csvContent), "tokens.csv");

      expect(response.status).toBe(200);
      expect(response.body.result.imported).toBe(2); // Apenas 2 categorias válidas
    });

    it("Should update existing token", async () => {
      
      
      const tokenName = 'Updated description';
      const csvContent = `symbol,name,categoryId
BTC,${tokenName},${createdCategoryId}`;

      const response = await request(app)
        .post("/import/tokens")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(csvContent), "update.csv");

      expect(response.status).toBe(200);
      expect(response.body.result.imported).toBe(1);

      // Verificar se a token foi atualizada
      const updatedToken = await prisma.token.findUnique({
        where: { id: createdTokenId },
      });

      expect(updatedToken?.name).toBe(tokenName);
    });
  });

  describe("Token Balances Import", () => {
    it("Should handle empty CSV file", async () => {
      const csvContent = `price,amount,operationAt,notes,operationType,tokenId`;
      

      const response = await request(app)
        .post("/import/token-balances")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(csvContent), "empty.csv");

      expect(response.status).toBe(200);
      expect(response.body.result.imported).toBe(0);
    });

    it("Should import token balances successfully from CSV", async () => {

    

      const newDate = new Date().toISOString();

      const csvContent = `price,amount,operationAt,notes,operationType,tokenId
115000.54,0.1,${newDate},Buy,BUY,${createdTokenId}
120000.54,0.01,${newDate},Sell,SELL,${createdTokenId}
118000.54,0.12,${newDate},Buy,BUY,${createdTokenId}`;

      const response = await request(app)
        .post("/import/token-balances")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(csvContent), "token-balances.csv");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("result");
      expect(response.body.result).toHaveProperty("message");
      expect(response.body.result).toHaveProperty("imported", 3);
      expect(response.body.result).toHaveProperty("tokenBalances");
      expect(Array.isArray(response.body.result.tokenBalances)).toBe(true);
    });

    it("Should skip rows with empty names", async () => {


      const newDate = new Date().toISOString();

      const csvContent = `price,amount,operationAt,notes,operationType,tokenId
115000.54,0.1,${newDate},Buy,BUY,${createdTokenId}
115000.54,0.1,${newDate},Buy,BUY,
,0.01,${newDate},Sell,SELL,${createdTokenId}
120000.54,,${newDate},Sell,SELL,${createdTokenId}
120000.54,0.01,${newDate},,,${createdTokenId}
120000.54,0.01,${newDate},Sell,SELL,${createdTokenId}
118000.54,0.12,${newDate},Buy,BUY,${createdTokenId}`;

      const response = await request(app)
        .post("/import/token-balances")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(csvContent), "token-balances.csv");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("result");
      expect(response.body.result).toHaveProperty("message");
      expect(response.body.result).toHaveProperty("imported", 3);
      expect(response.body.result).toHaveProperty("tokenBalances");
      expect(Array.isArray(response.body.result.tokenBalances)).toBe(true);
      expect(response.body.result.imported).toBe(3); 
    });

    it("Should fail on negative balance amount", async () => {


      const newDate = new Date().toISOString();

      const csvContent = `price,amount,operationAt,notes,operationType,tokenId
115000.54,0.1,${newDate},Buy,BUY,${createdTokenId}
120000.54,0.25,${newDate},Sell,SELL,${createdTokenId}
118000.54,0.12,${newDate},Buy,BUY,${createdTokenId}`;

      const response = await request(app)
        .post("/import/token-balances")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from(csvContent), "token-balances.csv");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe(MESSAGES.TOKEN_BALANCE.INSUFFICIENT_FUNDS_TO_SELL); 
    });

  });



});