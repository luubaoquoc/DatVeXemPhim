import express from 'express'
import { getDashboardData, filterDashboard } from '../controllers/dashboardController.js'

const router = express.Router()

// Dashboard Data Route
router.get('/dashboard', getDashboardData)
router.get('/dashboard/filter', filterDashboard)

export default router