import express from 'express';
import { listSuatChieus, getSuatChieu, createSuatChieu, updateSuatChieu, deleteSuatChieu, getRapsForMovieDate } from '../controllers/suatChieuControllers.js';
import { authenticateToken, hasRole } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/raps', getRapsForMovieDate);
router.get('/', listSuatChieus);
router.get('/:maSuatChieu', getSuatChieu);


router.post('/', authenticateToken, hasRole(3, 4), createSuatChieu);
router.put('/:maSuatChieu', authenticateToken, hasRole(3, 4), updateSuatChieu);
router.delete('/:maSuatChieu', authenticateToken, hasRole(3, 4), deleteSuatChieu);

export default router;
