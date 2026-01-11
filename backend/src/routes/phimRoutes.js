import express from 'express';
import { getAllPhim, getPhim, createPhim, updatePhim, deletePhim, likePhim, unlikePhim, getLikedPhims, getUserDanhGia, danhGiaPhim } from '../controllers/phimControllers.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../configs/multer.js';

const router = express.Router();


router.get('/', getAllPhim);
router.get('/:maPhim', getPhim);

router.get('/liked', authenticateToken, getLikedPhims);

router.post('/:maPhim/like', authenticateToken, likePhim);
router.delete('/:maPhim/like', authenticateToken, unlikePhim);


router.get('/:maPhim/danhgia', authenticateToken, getUserDanhGia);
router.post('/:maPhim/danhgia', authenticateToken, danhGiaPhim);

router.post('/', authenticateToken, isAdmin, upload.single('poster'), createPhim);
router.put('/:maPhim', authenticateToken, isAdmin, upload.single('poster'), updatePhim);
router.delete('/:maPhim', authenticateToken, isAdmin, deletePhim);

export default router;