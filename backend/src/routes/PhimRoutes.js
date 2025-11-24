import express from 'express';
import { listPhims, getPhim, createPhim, updatePhim, deletePhim, likePhim, unlikePhim, getLikedPhims, getUserDanhGia, danhGiaPhim } from '../controllers/phimControllers.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../configs/multer.js';

const router = express.Router();

// public
router.get('/', listPhims);
// user's liked movies
router.get('/liked', authenticateToken, getLikedPhims);
router.get('/:maPhim', getPhim);

// like / unlike
router.post('/:maPhim/like', authenticateToken, likePhim);
router.delete('/:maPhim/like', authenticateToken, unlikePhim);

// đánh giá phim
router.get('/:maPhim/danhgia', authenticateToken, getUserDanhGia);
router.post('/:maPhim/danhgia', authenticateToken, danhGiaPhim);

// protected - only admins can create/update/delete
router.post('/', authenticateToken, isAdmin, upload.single('poster'), createPhim);
router.put('/:maPhim', authenticateToken, isAdmin, upload.single('poster'), updatePhim);
router.delete('/:maPhim', authenticateToken, isAdmin, deletePhim);

export default router;