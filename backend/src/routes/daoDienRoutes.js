import express from 'express'
import {
  getAllDaoDien,
  createDaoDien,
  updateDaoDien,
  deleteDaoDien
} from '../controllers/daoDienController.js'
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticateToken, isAdmin, getAllDaoDien)
router.post('/', authenticateToken, isAdmin, createDaoDien)
router.put('/:maDaoDien', authenticateToken, isAdmin, updateDaoDien)
router.delete('/:maDaoDien', authenticateToken, isAdmin, deleteDaoDien)

export default router
