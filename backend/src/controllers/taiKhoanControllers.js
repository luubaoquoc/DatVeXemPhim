import cloudinary from '../configs/cloudinary.js';
import Rap from '../models/Rap.js';
import TaiKhoan from '../models/TaiKhoan.js';
import bcrypt from 'bcryptjs';
import streamifier from 'streamifier'
import VaiTro from '../models/VaiTro.js';
import { Op } from 'sequelize';

// Lấy danh sách tài khoản với phân trang và lọc
export const listUsers = async (req, res) => {
  try {

    const { maVaiTro: roleUser, maRap: rapUser } = req.user;

    const maVaiTro = req.query.maVaiTro || "";
    const maRap = req.query.maRap || "";

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const offset = (page - 1) * limit;
    const whereOp = {
      ...(search && {
        [Op.or]: {
          email: { [Op.like]: `%${search}%` },
          hoTen: { [Op.like]: `%${search}%` }
        },
      }),
      ...(maVaiTro && { maVaiTro }),
    };

    if (roleUser === 4) {
      if (maRap) {
        whereOp.maRap = maRap;
      }
    }
    else if (roleUser === 3) {
      whereOp.maRap = rapUser;
    }
    else {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const { count, rows } = await TaiKhoan.findAndCountAll({
      where: whereOp,
      include: [
        { model: Rap, as: 'rapLamViec' },
        { model: VaiTro, as: 'vaiTro' }
      ],
      limit,
      offset,
      order: [['maTaiKhoan', 'DESC']]
    })


    return res.json({
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('listUsers error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy danh sách vai trò
export const listVaiTro = async (req, res) => {
  try {
    const vaiTros = await VaiTro.findAll();
    return res.json(vaiTros);
  } catch (error) {
    console.error('listVaiTro error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};


// tạo tài khoản
export const createTaiKhoan = async (req, res) => {
  try {

    const { maVaiTro: roleUser, maRap: rapUser } = req.user;
    const { hoTen, email, matKhau, soDienThoai, maVaiTro, maRap } = req.body;

    if (roleUser === 3 && ![2, 3].includes(Number(maVaiTro))) {
      return res.status(403).json({ message: "Không có quyền gán vai trò này" });
    }
    if (roleUser === 3 && Number(maRap) !== Number(rapUser)) {
      return res.status(403).json({ message: "Không thể tạo user cho rạp khác" });
    }
    if (!hoTen || !email || !matKhau) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }
    if (soDienThoai && (soDienThoai.length < 10 || soDienThoai.length > 10)) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
    }
    const existingUser = await TaiKhoan.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }
    const hashed = await bcrypt.hash(matKhau, 10);
    const newUser = await TaiKhoan.create({
      hoTen,
      email,
      matKhau: hashed,
      soDienThoai,
      emailXacThuc: true,
      maVaiTro: maVaiTro || 1,
      maRap: maRap || null,
    });
    return res.status(201).json({ message: 'Tạo tài khoản thành công', user: newUser });
  } catch (error) {
    console.error('lỗi tạo tài khoản:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// lấy thông tin tài khoản
export const getUser = async (req, res) => {
  try {
    const ma = Number(req.params.maTaiKhoan);
    if (!ma) return res.status(400).json({ message: 'maTaiKhoan không hợp lệ' });

    const user = await TaiKhoan.findByPk(ma, { attributes: { exclude: ['matKhau'] } });
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });
    return res.json(user);
  } catch (error) {
    console.error('lỗi lấy thông tin tài khoản:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};




// cập nhật tài khoản
export const updateUser = async (req, res) => {
  try {
    const { maVaiTro: roleUser, maRap: rapUser } = req.user;
    const ma = Number(req.params.maTaiKhoan);

    if (!ma) return res.status(400).json({ message: 'maTaiKhoan không hợp lệ' });

    const user = await TaiKhoan.findByPk(ma);
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    const { hoTen, email, soDienThoai, maVaiTro, maRap } = req.body;

    //  Quản lý rạp không được gán role khác 2,3
    if (roleUser === 3 && maVaiTro && ![2, 3].includes(Number(maVaiTro))) {
      return res.status(403).json({ message: "Không có quyền gán vai trò này" });
    }

    //  Quản lý rạp chỉ sửa user trong rạp của mình
    if (roleUser === 3 && user.maRap !== rapUser) {
      return res.status(403).json({ message: "Không có quyền sửa tài khoản rạp khác" });
    }

    if (soDienThoai && (soDienThoai.length < 10 || soDienThoai.length > 10)) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
    }
    const updateData = {
      hoTen,
      email,
      soDienThoai,
      maVaiTro,
      maRap,
    };

    await user.update(updateData);
    const updated = await TaiKhoan.findByPk(ma);
    return res.json({ message: 'Cập nhật thành công', user: updated });
  } catch (error) {
    console.error('lỗi cập nhật tài khoản:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// xóa tài khoản
export const deleteUser = async (req, res) => {
  try {
    const ma = Number(req.params.maTaiKhoan);
    if (!ma) return res.status(400).json({ message: 'maTaiKhoan không hợp lệ' });

    const user = await TaiKhoan.findByPk(ma);
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    await user.destroy();
    return res.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error('lỗi xóa tài khoản:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};


// upload avatar
export const uploadAvatar = async (req, res) => {
  try {
    const ma = Number(req.params.maTaiKhoan);
    if (!ma) return res.status(400).json({ message: "maTaiKhoan không hợp lệ" });

    const user = await TaiKhoan.findByPk(ma);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn ảnh" });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "avatars",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            console.error(' Lỗi upload Cloudinary:', error)
            return reject(error)
          }
          resolve(result)
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    await user.update({ anhDaiDien: uploadResult.secure_url });

    return res.json({
      message: "Cập nhật ảnh đại diện thành công",
      anhDaiDien: uploadResult.secure_url,
    });

  } catch (error) {
    console.error("lỗi upload ảnh đại diện:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    const ma = Number(req.params.maTaiKhoan);
    if (!ma) return res.status(400).json({ message: 'maTaiKhoan không hợp lệ' });

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu cũ và mật khẩu mới' });
    }
    const user = await TaiKhoan.findByPk(ma);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    const isMatch = await bcrypt.compare(oldPassword, user.matKhau);
    if (!isMatch) return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ matKhau: hashed });

    return res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("lỗi đổi mật khẩu:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};


// khóa tài khoản
export const khoaTaiKhoan = async (req, res) => {
  try {
    const maTaiKhoan = Number(req.params.maTaiKhoan);
    if (typeof maTaiKhoan !== 'number') {
      return res.status(400).json({ message: "Thông tin không hợp lệ" });
    }
    const user = await TaiKhoan.findByPk(maTaiKhoan);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });
    await user.update({ khoaTaiKhoan: true });
    return res.json({ message: "Khóa tài khoản thành công" });
  } catch (error) {
    console.error("lỗi khóa tài khoản:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};


// mở khóa tài khoản
export const moKhoaTaiKhoan = async (req, res) => {
  try {
    const maTaiKhoan = Number(req.params.maTaiKhoan);
    if (typeof maTaiKhoan !== 'number') {
      return res.status(400).json({ message: "Thông tin không hợp lệ" });
    }
    const user = await TaiKhoan.findByPk(maTaiKhoan);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });
    await user.update({ khoaTaiKhoan: false });
    return res.json({ message: "Mở khóa tài khoản thành công" });
  } catch (error) {
    console.error("lỗi mở khóa tài khoản:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
