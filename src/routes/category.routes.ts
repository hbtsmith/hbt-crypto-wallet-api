import { Router } from "express";
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
} from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, listCategories);
router.get("/:id", authMiddleware, getCategory);
router.post("/", authMiddleware, createCategory);
router.put("/:id", authMiddleware, updateCategory);

export default router;
