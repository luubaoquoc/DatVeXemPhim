import express from 'express';
import { listUsers, getUser, updateUser, deleteUser, uploadAvatar, changePassword } from '../controllers/nguoiDungControllers.js';
import { authenticateToken, isAdmin, isSelfOrAdmin } from '../middleware/authMiddleware.js';
import upload from '../configs/multer.js';

const router = express.Router();

router.get('/', authenticateToken, isAdmin, listUsers);
router.get('/:maTaiKhoan', authenticateToken, isSelfOrAdmin, getUser);
router.put('/:maTaiKhoan', authenticateToken, isSelfOrAdmin, updateUser);
router.delete('/:maTaiKhoan', authenticateToken, isAdmin, deleteUser);
router.put('/:maTaiKhoan/avatar',
  authenticateToken,
  isSelfOrAdmin,
  upload.single("avatar"),
  uploadAvatar
);
router.put('/:maTaiKhoan/change-password', authenticateToken, isSelfOrAdmin, changePassword);


export default router;