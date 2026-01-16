import express from 'express'
import { getDashboardData, filterDashboard} from '../controllers/dashboardController.js'
import { authenticateToken, hasRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/dashboard', authenticateToken, hasRole(2, 3, 4), getDashboardData)
router.get('/dashboard/filter', authenticateToken, hasRole(2, 3, 4), filterDashboard)
// router.post("/dashboard/export-pdf", authenticateToken, hasRole(2, 3, 4), exportDashboardPDF )


export default router