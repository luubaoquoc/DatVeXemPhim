import DanhGia from "../models/DanhGia.js";
import Phim from "../models/Phim.js";
import TaiKhoan from "../models/TaiKhoan.js";
import { Op } from "sequelize";


// lấy danh sách đánh giá với phân trang và tìm kiếm
export const getAllDanhGia = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const where = {
      ...(search && { '$phim.tenPhim$': { [Op.like]: `%${search}%` } })
    }

    const { count, rows } = await DanhGia.findAndCountAll({
      where,
      include: [
        {
          model: TaiKhoan,
          as: 'taiKhoan',
          attributes: ['hoTen']
        },
        {
          model: Phim,
          as: 'phim',
          attributes: ['tenPhim']
        }
      ],
      limit,
      offset,
      order: [["maDanhGia", "DESC"]]
    });

    return res.json({
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách đánh giá:", error);
    return res.status(500).json({ message: "Lỗi Server" });
  }
};


// Cập nhật đánh giá
export const updateDanhGia = async (req, res) => {
  try {
    const { maDanhGia } = req.params;
    const { diem } = req.body;

    const danhGia = await DanhGia.findByPk(maDanhGia);
    if (!danhGia) {
      return res.status(404).json({ message: "Đánh giá không tồn tại" });
    }

    await danhGia.update({ diem, ngayDanhGia: new Date() });

    res.json({ message: "Cập nhật thành công", data: danhGia });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// Xóa đánh giá
export const deleteDanhGia = async (req, res) => {
  try {
    const { maDanhGia } = req.params;
    const danhGia = await DanhGia.findByPk(maDanhGia);

    if (!danhGia) {
      return res.status(404).json({ message: "Đánh giá không tồn tại" });
    }
    await danhGia.destroy();
    return res.json({ message: "Xóa đánh giá thành công" });
  } catch (error) {
    console.error("Lỗi xóa đánh giá:", error);
    return res.status(500).json({ message: "Lỗi Server" });
  }
};