import express from 'express';
import { createDatVe, listMyDatVes, getDatVe, updateDatVeStatus, getGheDaDat, createCheckoutForDatVe } from '../controllers/datVeControllers.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, createDatVe);
router.post('/:maDatVe/checkout', authenticateToken, createCheckoutForDatVe);
router.get('/user', authenticateToken, listMyDatVes);
router.get('/ghe-da-dat/:maSuatChieu', authenticateToken, getGheDaDat);
router.get('/:maDatVe', authenticateToken, getDatVe);
router.put('/:maDatVe/status', authenticateToken, isAdmin, updateDatVeStatus);

export default router;
