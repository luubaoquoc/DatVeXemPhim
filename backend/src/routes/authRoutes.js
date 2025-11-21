import express from 'express'
import { register, verifyOtp, resendOtp, login, refreshToken, logout } from '../controllers/authControllers.js';

const router = express.Router();

router.post("/register", register)
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login)
router.post("/logout", logout)
router.get("/refresh", refreshToken)

export default router;