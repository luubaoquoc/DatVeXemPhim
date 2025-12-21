import express from 'express';
import {
  getAllDatVe, createDatVe, getDatVe, listMyDatVes, getGheDaDat, createCheckoutForDatVe,
  deleteDatVe, checkInDatVe, getThongTinDatVe, BanVeTaiQuay
} from '../controllers/datVeControllers.js';
import { authenticateToken, hasRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, hasRole(2, 3, 4), getAllDatVe)
router.post('/', authenticateToken, createDatVe);
router.get('/user', authenticateToken, listMyDatVes);
router.get('/:maDatVe', authenticateToken, getDatVe);
router.post('/:maDatVe/checkout', authenticateToken, createCheckoutForDatVe);
router.get('/:maChiTiet/checkin', authenticateToken, hasRole(2, 3, 4), getThongTinDatVe);
router.post('/:maChiTiet/checkin', authenticateToken, hasRole(2, 3, 4), checkInDatVe);
router.post('/thanhtoan', authenticateToken, hasRole(2, 3, 4), BanVeTaiQuay);
router.get('/ghe-da-dat/:maSuatChieu', authenticateToken, getGheDaDat);
router.delete('/:maDatVe', authenticateToken, hasRole(3, 4), deleteDatVe);

export default router;
