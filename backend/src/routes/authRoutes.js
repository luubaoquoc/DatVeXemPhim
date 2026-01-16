import express from 'express'
import { 
    register, 
    verifyOtp, 
    resendOtp, 
    login, 
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    refreshToken, 
    logout 
} from '../controllers/authControllers.js';

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-otp", verifyResetOtp );
router.post("/reset-password", resetPassword  );
router.post("/logout", logout);
router.get("/refresh", refreshToken);

export default router;