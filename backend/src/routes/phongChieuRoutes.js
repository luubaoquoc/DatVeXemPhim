import express from "express";
import {
  listPhongChieu,
  themMoiPhongChieu,
  suaPhongChieu,
  xoaPhongChieu
} from "../controllers/phongChieuController.js";
import { authenticateToken, hasRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, hasRole(3, 4), listPhongChieu);
router.post("/", authenticateToken, hasRole(3, 4), themMoiPhongChieu);
router.put("/:maPhong", authenticateToken, hasRole(3, 4), suaPhongChieu);
router.delete("/:maPhong", authenticateToken, hasRole(3, 4), xoaPhongChieu);

export default router;
