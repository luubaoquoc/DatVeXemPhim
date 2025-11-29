import express from 'express';
import {
  getAllDatVe, createDatVe, listMyDatVes,
  // getDatVe, 
  getGheDaDat, createCheckoutForDatVe, deleteDatVe
} from '../controllers/datVeControllers.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, isAdmin, getAllDatVe)
router.post('/', authenticateToken, createDatVe);
router.post('/:maDatVe/checkout', authenticateToken, createCheckoutForDatVe);
router.get('/user', authenticateToken, listMyDatVes);
router.get('/ghe-da-dat/:maSuatChieu', authenticateToken, getGheDaDat);
router.delete('/:maDatVe', authenticateToken, isAdmin, deleteDatVe);
// router.get('/:maDatVe', authenticateToken, getDatVe);

export default router;
