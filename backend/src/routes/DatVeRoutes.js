import express from 'express';
import {
  getAllDatVe, createDatVe, listMyDatVes,
  // getDatVe, 
  getGheDaDat, createCheckoutForDatVe, deleteDatVe, checkInDatVe, getThongTinDatVe
} from '../controllers/datVeControllers.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, isAdmin, getAllDatVe)
router.post('/', authenticateToken, createDatVe);
router.post('/:maDatVe/checkout', authenticateToken, createCheckoutForDatVe);
router.get('/:maDatVe/checkin', authenticateToken, isAdmin, getThongTinDatVe);
router.post('/:maDatVe/checkin', authenticateToken, isAdmin, checkInDatVe);
router.get('/user', authenticateToken, listMyDatVes);
router.get('/ghe-da-dat/:maSuatChieu', authenticateToken, getGheDaDat);
router.delete('/:maDatVe', authenticateToken, isAdmin, deleteDatVe);

export default router;
