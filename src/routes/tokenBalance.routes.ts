import { Router } from "express";
import {
  createTokenBalance,
  listTokenBalance,
  getTokenBalance,
  getTotalAmountBalance,
  getTotalValueBalance,
  deleteTokenBalance,
} from "../controllers/tokenBalance.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../helpers/async-handler";

const router = Router();

router.post("/", authMiddleware, asyncHandler(createTokenBalance));
router.get("/", authMiddleware, asyncHandler(listTokenBalance));
router.get("/:id", authMiddleware, asyncHandler(getTokenBalance));
// router.put("/:id", authMiddleware, asyncHandler(updateTokenBalance));
router.delete("/:id", authMiddleware, asyncHandler(deleteTokenBalance));

// /src/routes/tokenBalance.routes.ts
router.get("/balance/:tokenId/amount", authMiddleware, getTotalAmountBalance);
router.get("/balance/:tokenId/value", authMiddleware, getTotalValueBalance);

export default router;
