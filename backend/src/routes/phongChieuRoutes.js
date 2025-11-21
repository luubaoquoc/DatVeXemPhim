import express from "express";
import {
  listPhongChieu,
  themMoiPhongChieu,
  suaPhongChieu,
  xoaPhongChieu
} from "../controllers/phongChieuController.js";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, isAdmin, listPhongChieu);                // Lấy danh sách phòng
router.post("/", authenticateToken, isAdmin, themMoiPhongChieu);            // Thêm phòng + tạo ghế
router.put("/:maPhong", authenticateToken, isAdmin, suaPhongChieu);              // Sửa phòng + cập nhật ghế
router.delete("/:maPhong", authenticateToken, isAdmin, xoaPhongChieu);           // Xóa phòng + ghế

export default router;
