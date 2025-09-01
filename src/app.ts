import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swagger.json";
import categoryRoutes from "./routes/category.routes";
import tokenRoutes from "./routes/token.routes";
import authRoutes from "./routes/auth.routes";
import tokenBalance from "./routes/tokenBalance.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rota da documentação Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (_, res) => res.send("Crypto Portfolio API ✅"));
app.use("/categories", categoryRoutes);
app.use("/tokens", tokenRoutes);
app.use("/auth", authRoutes);
app.use("/token-balance", tokenBalance);

export default app;
