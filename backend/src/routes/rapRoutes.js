import express from "express";
import {
  getRaps,
  getRapById,
  createRap,
  updateRap,
  deleteRap
} from "../controllers/rapController.js";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";
import upload from "../configs/multer.js";

const router = express.Router();

router.get("/", getRaps);
router.get("/:maRap", getRapById);
router.post("/", authenticateToken, isAdmin, upload.single("hinhAnh"), createRap);
router.put("/:maRap", authenticateToken, isAdmin, upload.single("hinhAnh"), updateRap);
router.delete("/:maRap", authenticateToken, isAdmin, deleteRap);

export default router;
