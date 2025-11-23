import express from 'express'
import {
  getAllDienVien,
  createDienVien,
  updateDienVien,
  deleteDienVien
} from '../controllers/dienVienController.js'
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getAllDienVien)
router.post('/', authenticateToken, isAdmin, createDienVien)
router.put('/:maDienVien', authenticateToken, isAdmin, updateDienVien)
router.delete('/:maDienVien', authenticateToken, isAdmin, deleteDienVien)

export default router
