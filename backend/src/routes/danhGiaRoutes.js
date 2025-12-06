import express from 'express';
import { listDanhGias, updateDanhGia, deleteDanhGia } from '../controllers/danhGiaController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, isAdmin, listDanhGias);
router.put('/:maDanhGia', authenticateToken, isAdmin, updateDanhGia);
router.delete('/:maDanhGia', authenticateToken, isAdmin, deleteDanhGia);

export default router;