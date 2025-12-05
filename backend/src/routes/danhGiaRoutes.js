import express from 'express';
import { deleteDanhGia, listDanhGias } from '../controllers/danhGiaController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, isAdmin, listDanhGias);
router.delete('/:maDanhGia', authenticateToken, isAdmin, deleteDanhGia);

export default router;