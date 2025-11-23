import express from 'express'
import {
  getAllAnhBanner,
  createAnhBanner,
  updateAnhBanner,
  deleteAnhBanner
} from '../controllers/anhBannerController.js'
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js'
import upload from '../configs/multer.js'

const router = express.Router()

router.get('/', getAllAnhBanner)
router.post('/', authenticateToken, isAdmin, upload.single('anh'), createAnhBanner)
router.put('/:maAnhBanner', authenticateToken, isAdmin, upload.single('anh'), updateAnhBanner)
router.delete('/:maAnhBanner', authenticateToken, isAdmin, deleteAnhBanner)

export default router
