import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validateFileUpload } from "../middlewares/file-validation.middleware";
import {
  importCategories,
  importTokens,
  importTokenBalances,
} from "../controllers/import.controller";

const router = Router();

// Middleware chain: Auth -> File Validation -> Controller
router.post("/categories", 
  authMiddleware, 
  validateFileUpload, 
  (req, res, next) => {
    importCategories(req, res).catch(next);
  }
);

router.post("/tokens", 
  authMiddleware, 
  validateFileUpload, 
  (req, res, next) => {
    importTokens(req, res).catch(next);
  }
);

router.post("/token-balances", 
  authMiddleware, 
  validateFileUpload, 
  (req, res, next) => {
    importTokenBalances(req, res).catch(next);
  }
);

export default router;
