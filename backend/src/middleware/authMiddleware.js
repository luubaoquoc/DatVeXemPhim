import jwt from 'jsonwebtoken';
import TaiKhoan from '../models/TaiKhoan.js';

// Authenticate access token from Authorization: Bearer <token>
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers['x-access-token'];
    if (!authHeader) return res.status(401).json({ message: 'Không có token' });

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    if (!token) return res.status(401).json({ message: 'Token không hợp lệ' });

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, async (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });

      // decoded contains { maTaiKhoan }
      const user = await TaiKhoan.findByPk(decoded.maTaiKhoan);
      if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

      // attach plain user data (exclude password)
      const u = user.get({ plain: true });
      delete u.matKhau;
      req.user = u;
      next();
    });
  } catch (error) {
    console.error('authenticateToken error', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// isAdmin: check maVaiTro equals 2 (adjust if your admin id is different)
export const isAdmin = (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Chưa xác thực' });
    // default: role 1 = user, 4 = admin (change if needed)
    if (req.user.maVaiTro === 4) return next();
    return res.status(403).json({ message: 'Yêu cầu quyền admin' });
  } catch (error) {
    console.error('isAdmin error', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// isSelfOrAdmin: allow if the requester is the same maTaiKhoan or an admin
export const isSelfOrAdmin = (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Chưa xác thực' });
    const target = Number(req.params.maTaiKhoan);
    if (req.user.maTaiKhoan === target) return next();
    if (req.user.maVaiTro === 4) return next();
    return res.status(403).json({ message: 'Không có quyền thực hiện hành động này' });
  } catch (error) {
    console.error('isSelfOrAdmin error', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};
