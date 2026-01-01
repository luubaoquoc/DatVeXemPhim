import PhongChieu from "../models/PhongChieu.js";
import Ghe from "../models/Ghe.js";
import { Op } from "sequelize";
import Rap from "../models/Rap.js";
import SuatChieu from "../models/SuatChieu.js";

// Tính layout dựa theo tổng số ghế
const getLayoutFromTotal = (total) => {

  // fallback auto như hình vuông
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  return { rows, cols };
};

// Tạo ghế theo layout
const generateSeats = (maPhong, tongSoGhe) => {
  const { rows, cols } = getLayoutFromTotal(tongSoGhe);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const seats = [];
  let created = 0;

  for (let r = 0; r < rows && created < tongSoGhe; r++) {
    for (let c = 1; c <= cols && created < tongSoGhe; c++) {
      seats.push({
        maPhong,
        hang: letters[r],
        soGhe: c,
        trangThai: true
      });
      created++;
    }
  }

  return seats;
};


// Kiểm tra phòng có suất chiếu trong tương lai không
const hasFutureShowtime = async (maPhong) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const count = await SuatChieu.count({
    where: {
      maPhong,
      gioBatDau: {
        [Op.gte]: today
      }
    }
  });

  return count > 0;
};


// lấy danh sách phòng chiếu với phân trang và lọc
export const listPhongChieu = async (req, res) => {
  try {

    const { maVaiTro, maRap: maRapUser } = req.user || {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const trangThai = req.query.trangThai || "";

    const offset = (page - 1) * limit;

    let maRap = req.query.maRap;
    if (maVaiTro === 3) {
      maRap = maRapUser;
    }
    const whereOp = {
      ...(search && { tenPhong: { [Op.like]: `%${search}%` } }),
      ...(maRap && { maRap: maRap }),
      ...(trangThai && { trangThai: trangThai })
    };

    const totalItems = await PhongChieu.count({ where: whereOp });

    const rows = await PhongChieu.findAll({
      where: whereOp,
      include: [
        { model: Rap, as: "rap", attributes: ["tenRap"], required: false }
      ],
      order: [["maPhong", "DESC"]],
      offset: offset,
      limit: limit,
    });
    res.json({
      data: rows,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy danh sách phòng chiếu" });
  }
};

// thêm mới phòng chiếu + sinh ghế
export const themMoiPhongChieu = async (req, res) => {
  const { maRap, tenPhong, tongSoGhe, trangThai } = req.body;
  if (!maRap || !tenPhong || !tongSoGhe)
    return res.status(400).json({ message: "Vui lòng điền đầy đủ tất cả các trường" });

  try {
    const phong = await PhongChieu.create({ maRap, tenPhong, tongSoGhe, trangThai });

    const seats = generateSeats(phong.maPhong, tongSoGhe);
    await Ghe.bulkCreate(seats);

    res.json({
      message: "Tạo phòng + sinh ghế thành công",
      phong,
      soGheDaSinh: seats.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi tạo phòng chiếu" });
  }
};

// sửa phòng chiếu + cập nhật ghế nếu thay đổi tổng số ghế
export const suaPhongChieu = async (req, res) => {
  const { maPhong } = req.params;
  const { maRap, tenPhong, tongSoGhe, trangThai } = req.body;

  try {
    const phong = await PhongChieu.findByPk(maPhong);
    if (!phong) return res.status(404).json({ message: "Không tìm thấy phòng" });


    const hasShowtime = await hasFutureShowtime(maPhong);
    if (hasShowtime) {
      return res.status(400).json({ message: "Phòng có suất chiếu tương lai, không thể sửa" });
    }

    const oldTotal = phong.tongSoGhe;

    await phong.update({
      maRap: maRap ?? phong.maRap,
      tenPhong: tenPhong ?? phong.tenPhong,
      tongSoGhe: tongSoGhe ?? phong.tongSoGhe,
      trangThai: trangThai ?? phong.trangThai
    });

    if (tongSoGhe && tongSoGhe !== oldTotal) {
      await Ghe.destroy({ where: { maPhong } });
      const newSeats = generateSeats(maPhong, tongSoGhe);
      await Ghe.bulkCreate(newSeats);
    }

    res.json({
      message: "Sửa phòng chiếu thành công",
      phong
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi sửa phòng chiếu" });
  }
};

// xóa phòng chiếu + ghế
export const xoaPhongChieu = async (req, res) => {
  const { maPhong } = req.params;

  try {
    const phong = await PhongChieu.findByPk(maPhong);
    if (!phong) return res.status(404).json({ message: "Không tìm thấy phòng" });

    const hasShowtime = await hasFutureShowtime(maPhong);
    if (hasShowtime) {
      return res.status(400).json({ message: "Phòng có suất chiếu tương lai, không thể xóa" });
    }

    await Ghe.destroy({ where: { maPhong } });
    await PhongChieu.destroy({ where: { maPhong } });
    res.json({ message: "Xóa phòng chiếu + ghế thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi xóa phòng chiếu" });
  }
};
