import express from 'express';
import { getAllSuatChieu, getSuatChieu, createSuatChieu, updateSuatChieu, deleteSuatChieu, getRapsForMovieDate, getLichChieuByRapDate, getSuatByPhong } from '../controllers/suatChieuControllers.js';
import { authenticateToken, hasRole, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/', authenticateToken, hasRole(3, 4), getAllSuatChieu);
router.get('/raps', optionalAuth, getRapsForMovieDate);
router.get('/lich-chieu-rap', getLichChieuByRapDate);
router.get('/phong', getSuatByPhong)
router.get('/:maSuatChieu', getSuatChieu);


router.post('/', authenticateToken, hasRole(3, 4), createSuatChieu);
router.put('/:maSuatChieu', authenticateToken, hasRole(3, 4), updateSuatChieu);
router.delete('/:maSuatChieu', authenticateToken, hasRole(3, 4), deleteSuatChieu);

export default router;
