import express from "express";
import { listGheByPhong, updateGhe } from "../controllers/gheController.js";
import { authenticateToken, hasRole } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", authenticateToken, listGheByPhong);
router.put("/:maGhe", authenticateToken, hasRole(3, 4), updateGhe);

export default router;
