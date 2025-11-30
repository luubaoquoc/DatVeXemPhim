import express from 'express'
import {
  getAllDienVien,
  createDienVien,
  updateDienVien,
  deleteDienVien
} from '../controllers/dienVienController.js'
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js'
import upload from '../configs/multer.js'

const router = express.Router()

router.get('/', getAllDienVien)
router.post('/', authenticateToken, isAdmin, upload.single('anhDaiDien'), createDienVien)
router.put('/:maDienVien', authenticateToken, isAdmin, upload.single('anhDaiDien'), updateDienVien)
router.delete('/:maDienVien', authenticateToken, isAdmin, deleteDienVien)

export default router
