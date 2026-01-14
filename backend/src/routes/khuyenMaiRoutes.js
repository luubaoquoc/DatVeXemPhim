import express from 'express';
import {
  kiemTraMaKhuyenMai, 
  getDanhSachKhuyenMai,
  taoKhuyenMai, 
  capNhatKhuyenMai, 
  xoaKhuyenMai
} from '../controllers/khuyenMaiController.js';
import { authenticateToken, hasRole } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/kiem-tra', authenticateToken, kiemTraMaKhuyenMai);

router.get("/", authenticateToken, hasRole(3, 4), getDanhSachKhuyenMai);
router.post("/", authenticateToken, hasRole(3, 4), taoKhuyenMai);
router.put("/:id", authenticateToken, hasRole(3, 4), capNhatKhuyenMai);
router.delete("/:id", authenticateToken, hasRole(3, 4), xoaKhuyenMai);
export default router;