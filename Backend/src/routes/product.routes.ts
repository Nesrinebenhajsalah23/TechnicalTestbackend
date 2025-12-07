import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
} from "../controllers/product.controller";

const router = Router();

// GET /products (with optional ?category= filter)
router.get("/", getAllProducts);

// POST /products
router.post("/", createProduct);

// GET /products/:id
router.get("/:id", getProductById);

export default router;
