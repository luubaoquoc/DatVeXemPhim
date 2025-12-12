import jwt from 'jsonwebtoken';
import TaiKhoan from '../models/TaiKhoan.js';

// Xác thực JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers['x-access-token'];
    if (!authHeader) return res.status(401).json({ message: 'Không có token' });

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!token) return res.status(401).json({ message: 'Token không hợp lệ' });

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, async (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });

      const user = await TaiKhoan.findByPk(decoded.maTaiKhoan);
      if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

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

// ==========================
//   PHÂN QUYỀN THEO ROLE
// ==========================

// 1. Khách hàng
export const isCustomer = (req, res, next) => {
  if (req.user.maVaiTro === 1) return next();
  return res.status(403).json({ message: 'Yêu cầu quyền khách hàng' });
};

// 2. Nhân viên rạp
export const isStaff = (req, res, next) => {
  if (req.user.maVaiTro === 2) return next();
  return res.status(403).json({ message: 'Yêu cầu quyền nhân viên rạp' });
};

// 3. Quản lý rạp
export const isManager = (req, res, next) => {
  if (req.user.maVaiTro === 3) return next();
  return res.status(403).json({ message: 'Yêu cầu quyền quản lý rạp' });
};

// 4. Quản trị viên (Admin)
export const isAdmin = (req, res, next) => {
  if (req.user.maVaiTro === 4) return next();
  return res.status(403).json({ message: 'Yêu cầu quyền quản trị viên' });
};

// ==========================
//   MULTI ROLE CHECKER
// ==========================
// Cho phép truyền 1 hoặc nhiều quyền
// Ví dụ: hasRole(2,3) → nhân viên hoặc quản lý
//        hasRole(3,4) → quản lý hoặc admin
export const hasRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (allowedRoles.includes(req.user.maVaiTro)) return next();
    return res.status(403).json({ message: 'Không đủ quyền truy cập' });
  };
};

// ==========================
//   SELF OR HIGHER ROLE
// ==========================
// Cho phép *chính chủ*, hoặc cấp trên (Manager + Admin)
export const isSelfOrManagerOrAdmin = (req, res, next) => {
  const target = Number(req.params.maTaiKhoan);

  if (req.user.maTaiKhoan === target) return next();        // chính chủ
  if (req.user.maVaiTro === 3 || req.user.maVaiTro === 4)   // Manager hoặc Admin
    return next();

  return res.status(403).json({ message: 'Không có quyền thực hiện hành động này' });
};
