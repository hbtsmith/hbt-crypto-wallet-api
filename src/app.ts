import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swagger.json";
import categoryRoutes from "./routes/category.routes";
import tokenRoutes from "./routes/token.routes";
import authRoutes from "./routes/auth.routes";
import tokenBalance from "./routes/tokenBalance.routes";
import importRouter from "./routes/import.routes";
import tokenAlertRoutes from "./routes/tokenAlert.routes";
import internalRoutes from "./routes/internal.routes";
import { errorHandler } from "./middlewares/error.middleware";
import fileUpload from "express-fileupload";
import { initializeBullBoard } from "./services/alertScheduler/bullBoard";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Rota da documentação Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (_, res) => res.send("Crypto Portfolio API ✅"));
app.use("/categories", categoryRoutes);
app.use("/tokens", tokenRoutes);
app.use("/auth", authRoutes);
app.use("/token-balance", tokenBalance);
app.use("/token-alerts", tokenAlertRoutes);
app.use("/internal", internalRoutes);

app.use("/import", importRouter);

// Inicializa o Bull Board para monitoramento de filas
initializeBullBoard().then((bullBoardAdapter) => {
  app.use('/admin/queues', bullBoardAdapter.getRouter());
  console.log('🎯 Bull Board available at /admin/queues');
}).catch((error) => {
  console.error('❌ Failed to initialize Bull Board:', error);
});

app.use(errorHandler);

export default app;
