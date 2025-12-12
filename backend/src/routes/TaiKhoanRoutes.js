import express from 'express';
import {
  listUsers,
  listVaiTro,
  createTaiKhoan,
  getUser,
  updateUser,
  deleteUser,
  uploadAvatar,
  changePassword
} from '../controllers/taiKhoanControllers.js';

import {
  authenticateToken,
  isAdmin,
  isSelfOrManagerOrAdmin
} from '../middleware/authMiddleware.js';

import upload from '../configs/multer.js';

const router = express.Router();

// Admin mới được xem list tài khoản
router.get('/', authenticateToken, isAdmin, listUsers);

// Admin mới được xem danh sách vai trò
router.get('/vaitro', authenticateToken, isAdmin, listVaiTro);

// Admin mới được tạo tài khoản
router.post('/', authenticateToken, isAdmin, createTaiKhoan);

// Chính chủ hoặc Manager hoặc Admin
router.get('/:maTaiKhoan', authenticateToken, isSelfOrManagerOrAdmin, getUser);

// Chính chủ hoặc Manager hoặc Admin
router.put('/:maTaiKhoan', authenticateToken, isSelfOrManagerOrAdmin, updateUser);

// Chỉ Admin mới được xóa tài khoản
router.delete('/:maTaiKhoan', authenticateToken, isAdmin, deleteUser);

// Upload avatar: chính chủ + Manager + Admin
router.put('/:maTaiKhoan/avatar',
  authenticateToken,
  isSelfOrManagerOrAdmin,
  upload.single("avatar"),
  uploadAvatar
);

// Đổi mật khẩu: chính chủ + Manager + Admin
router.put('/:maTaiKhoan/change-password',
  authenticateToken,
  isSelfOrManagerOrAdmin,
  changePassword
);

export default router;
