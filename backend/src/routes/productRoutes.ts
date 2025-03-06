import express from "express";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductsByCategory } from "../controllers/productController";

const router = express.Router();

router.get("/", getProducts); // 
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/category/:category", getProductsByCategory);

export default router;
