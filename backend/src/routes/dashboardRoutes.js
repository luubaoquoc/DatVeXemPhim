import express from 'express'
import { getDashboardData, filterDashboard } from '../controllers/dashboardController.js'
import { authenticateToken, hasRole } from '../middleware/authMiddleware.js'

const router = express.Router()

// Dashboard Data Route
router.get('/dashboard', authenticateToken, hasRole(2, 3, 4), getDashboardData)
router.get('/dashboard/filter', authenticateToken, hasRole(2, 3, 4), filterDashboard)

export default router