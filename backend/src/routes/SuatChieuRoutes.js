import express from 'express';
import { listSuatChieus, getSuatChieu, getGheTheoPhong, createSuatChieu, updateSuatChieu, deleteSuatChieu, getDatesForMovie, getRapsForMovieDate } from '../controllers/suatChieuControllers.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/dates', getDatesForMovie);
router.get('/raps', getRapsForMovieDate);
router.get('/ghe/phong/:maPhong', getGheTheoPhong);
router.get('/', listSuatChieus);
router.get('/:maSuatChieu', getSuatChieu);


router.post('/', authenticateToken, isAdmin, createSuatChieu);
router.put('/:maSuatChieu', authenticateToken, isAdmin, updateSuatChieu);
router.delete('/:maSuatChieu', authenticateToken, isAdmin, deleteSuatChieu);

export default router;
