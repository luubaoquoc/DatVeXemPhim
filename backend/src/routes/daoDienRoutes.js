import express from 'express'
import {
  getAllDaoDien,
  createDaoDien,
  updateDaoDien,
  deleteDaoDien
} from '../controllers/daoDienController.js'
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js'
import upload from '../configs/multer.js'

const router = express.Router()

router.get('/', getAllDaoDien)
router.post('/', authenticateToken, isAdmin, upload.single('anhDaiDien'), createDaoDien)
router.put('/:maDaoDien', authenticateToken, isAdmin, upload.single('anhDaiDien'), updateDaoDien)
router.delete('/:maDaoDien', authenticateToken, isAdmin, deleteDaoDien)

export default router
