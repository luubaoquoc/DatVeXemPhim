import express from "express";
import {
  getRaps,
  getRapById,
  createRap,
  updateRap,
  deleteRap
} from "../controllers/rapController.js";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getRaps);
router.get("/:maRap", getRapById);
router.post("/", authenticateToken, isAdmin, createRap);
router.put("/:maRap", authenticateToken, isAdmin, updateRap);
router.delete("/:maRap", authenticateToken, isAdmin, deleteRap);

export default router;
