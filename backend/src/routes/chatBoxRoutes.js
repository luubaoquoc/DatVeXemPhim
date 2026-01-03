import express from "express";
import { chatWithAI, getRecommendedMovies, analyzeRevenueAI } from "../controllers/chatBoxControler.js";
import { authenticateToken, isAdmin, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chatbot", chatWithAI);
router.get("/de-xuat-phim", optionalAuth, getRecommendedMovies);
router.post("/phan-tich-doanh-thu", authenticateToken, isAdmin, analyzeRevenueAI);

export default router;
