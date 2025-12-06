import cloudinary from '../configs/cloudinary.js';
import Rap from '../models/Rap.js';
import TaiKhoan from '../models/TaiKhoan.js';
import bcrypt from 'bcryptjs';
import streamifier from 'streamifier'
import VaiTro from '../models/VaiTro.js';
import { Op } from 'sequelize';

// GET /api/taikhoan?page=1&limit=20
export const listUsers = async (req, res) => {
  try {
    const maVaiTro = req.query.maVaiTro || "";
    const maRap = req.query.maRap || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const offset = (page - 1) * limit;
    const whereOp = {
      ...(search && { hoTen: { [Op.like]: `%${search}%` } }),
      ...(maVaiTro && { maVaiTro: maVaiTro }),
      ...(maRap && { maRap: maRap }),
    };


    // Lấy danh sách tài khoản với phân trang
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


export const listVaiTro = async (req, res) => {
  try {
    const vaiTros = await VaiTro.findAll();
    return res.json(vaiTros);
  } catch (error) {
    console.error('listVaiTro error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};



export const createTaiKhoan = async (req, res) => {
  try {
    const { hoTen, email, matKhau, soDienThoai, maVaiTro, maRap } = req.body;
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
    console.error('createTaiKhoan error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// GET /api/taikhoan/:maTaiKhoan
export const getUser = async (req, res) => {
  try {
    const ma = Number(req.params.maTaiKhoan);
    if (!ma) return res.status(400).json({ message: 'maTaiKhoan không hợp lệ' });

    const user = await TaiKhoan.findByPk(ma, { attributes: { exclude: ['matKhau'] } });
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });
    return res.json(user);
  } catch (error) {
    console.error('getUser error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};




// PUT /api/taikhoan/:maTaiKhoan
export const updateUser = async (req, res) => {
  try {
    const ma = Number(req.params.maTaiKhoan);
    if (!ma) return res.status(400).json({ message: 'maTaiKhoan không hợp lệ' });

    const user = await TaiKhoan.findByPk(ma);
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    // chỉ cho sửa các trường sau
    const { hoTen, email, soDienThoai, maVaiTro, maRap } = req.body;

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
    console.error('updateUser error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// DELETE /api/taikhoan/:maTaiKhoan
export const deleteUser = async (req, res) => {
  try {
    const ma = Number(req.params.maTaiKhoan);
    if (!ma) return res.status(400).json({ message: 'maTaiKhoan không hợp lệ' });

    const user = await TaiKhoan.findByPk(ma);
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    await user.destroy();
    return res.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error('deleteUser error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const ma = Number(req.params.maTaiKhoan);
    if (!ma) return res.status(400).json({ message: "maTaiKhoan không hợp lệ" });

    const user = await TaiKhoan.findByPk(ma);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn ảnh" });
    }

    // Upload Cloudinary
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

    // update db
    await user.update({ anhDaiDien: uploadResult.secure_url });

    return res.json({
      message: "Cập nhật ảnh đại diện thành công",
      anhDaiDien: uploadResult.secure_url,
    });

  } catch (error) {
    console.error("uploadAvatar error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// PUT /api/taikhoan/:maTaiKhoan/change-password
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
    console.error("changePassword error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};


