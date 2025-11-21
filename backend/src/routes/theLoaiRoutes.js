import express from 'express'
import {
  getAllTheLoai,
  createTheLoai,
  updateTheLoai,
  deleteTheLoai
} from '../controllers/theLoaiController.js'
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticateToken, isAdmin, getAllTheLoai)
router.post('/', authenticateToken, isAdmin, createTheLoai)
router.put('/:maTheLoai', authenticateToken, isAdmin, updateTheLoai)
router.delete('/:maTheLoai', authenticateToken, isAdmin, deleteTheLoai)

export default router
