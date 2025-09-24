import { Router } from "express";
import { register, login, refreshToken, updateDeviceToken } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.put("/device-token", authMiddleware, updateDeviceToken);

export default router;
