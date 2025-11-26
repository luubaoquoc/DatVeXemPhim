import express from 'express';
import { listSuatChieus, getSuatChieu, createSuatChieu, updateSuatChieu, deleteSuatChieu, getRapsForMovieDate } from '../controllers/suatChieuControllers.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/raps', getRapsForMovieDate);
router.get('/', listSuatChieus);
router.get('/:maSuatChieu', getSuatChieu);


router.post('/', authenticateToken, isAdmin, createSuatChieu);
router.put('/:maSuatChieu', authenticateToken, isAdmin, updateSuatChieu);
router.delete('/:maSuatChieu', authenticateToken, isAdmin, deleteSuatChieu);

export default router;
