import { Router } from "express";
import {
  createToken,
  listToken,
  getToken,
  updateToken,
  deleteToken,
} from "../controllers/token.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../helpers/async-handler";

const router = Router();

router.post("/", authMiddleware, asyncHandler(createToken));
router.get("/", authMiddleware, asyncHandler(listToken));
router.get("/:id", authMiddleware, asyncHandler(getToken));
router.put("/:id", authMiddleware, asyncHandler(updateToken));
router.delete("/:id", authMiddleware, asyncHandler(deleteToken));

export default router;
