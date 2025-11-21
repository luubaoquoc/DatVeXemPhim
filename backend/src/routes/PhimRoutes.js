import express from 'express';
import { listPhims, getPhim, createPhim, updatePhim, deletePhim } from '../controllers/phimControllers.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../configs/multer.js';

const router = express.Router();

// public
router.get('/', listPhims);
router.get('/:maPhim', getPhim);

// protected - only admins can create/update/delete
router.post('/', authenticateToken, isAdmin, upload.single('poster'), createPhim);
router.put('/:maPhim', authenticateToken, isAdmin, upload.single('poster'), updatePhim);
router.delete('/:maPhim', authenticateToken, isAdmin, deletePhim);

export default router;