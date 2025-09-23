import { Router } from "express";
import {
  createTokenAlert,
  listTokenAlert,
  getTokenAlert,
  updateTokenAlert,
  deleteTokenAlert,
  activateTokenAlert,
  deactivateTokenAlert,
} from "../controllers/tokenAlert.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { asyncHandler } from "../helpers/async-handler";

const router = Router();

router.post("/", authMiddleware, asyncHandler(createTokenAlert));
router.get("/", authMiddleware, asyncHandler(listTokenAlert));
router.get("/:id", authMiddleware, asyncHandler(getTokenAlert));
router.put("/:id", authMiddleware, asyncHandler(updateTokenAlert));
router.delete("/:id", authMiddleware, asyncHandler(deleteTokenAlert));
router.patch("/:id/activate", authMiddleware, asyncHandler(activateTokenAlert));
router.patch("/:id/deactivate", authMiddleware, asyncHandler(deactivateTokenAlert));

export default router;

