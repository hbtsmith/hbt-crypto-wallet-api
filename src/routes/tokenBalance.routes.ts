import { Router } from "express";
import {
  createTokenBalance,
  listTokenBalance,
  getTokenBalance,
  updateTokenBalance,
  deleteTokenBalance,
} from "../controllers/tokenBalance.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createTokenBalance);
router.get("/", authMiddleware, listTokenBalance);
router.get("/:id", authMiddleware, getTokenBalance);
router.put("/:id", authMiddleware, updateTokenBalance);
router.delete("/:id", authMiddleware, deleteTokenBalance);

export default router;
