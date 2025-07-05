import express from "express";
import {  getFeaturedProducts, getAllProducts, createProduct, deleteProduct, getRecommendedProducts, toggleFeaturedProduct, getProductsByCategory} from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/recommendations", getRecommendedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/", protectRoute, adminRoute, createProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.get("/:id", protectRoute, adminRoute, deleteProduct);
export default router;
