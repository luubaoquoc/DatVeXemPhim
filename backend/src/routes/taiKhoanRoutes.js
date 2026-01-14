import express from 'express';
import {
  listUsers,
  listVaiTro,
  createTaiKhoan,
  getUser,
  updateUser,
  deleteUser,
  uploadAvatar,
  changePassword,
  khoaTaiKhoan,
  moKhoaTaiKhoan
} from '../controllers/taiKhoanControllers.js';

import { authenticateToken, hasRole, isSelfOrManagerOrAdmin } from '../middleware/authMiddleware.js';
import upload from '../configs/multer.js';

const router = express.Router();

router.get('/', authenticateToken, hasRole(3, 4), listUsers);
router.get('/vaitro', authenticateToken, hasRole(3, 4), listVaiTro);
router.post('/', authenticateToken, hasRole(3, 4), createTaiKhoan);
router.get('/:maTaiKhoan', authenticateToken, isSelfOrManagerOrAdmin, getUser);
router.put('/:maTaiKhoan', authenticateToken, isSelfOrManagerOrAdmin, updateUser);
router.delete('/:maTaiKhoan', authenticateToken, hasRole(4), deleteUser);
router.put('/:maTaiKhoan/avatar',
  authenticateToken,
  isSelfOrManagerOrAdmin,
  upload.single("avatar"),
  uploadAvatar
);
router.put('/:maTaiKhoan/change-password',
  authenticateToken,
  isSelfOrManagerOrAdmin,
  changePassword
);

router.put('/:maTaiKhoan/khoa', authenticateToken, hasRole(4), khoaTaiKhoan);
router.put('/:maTaiKhoan/mo-khoa', authenticateToken, hasRole(4), moKhoaTaiKhoan);

export default router;
