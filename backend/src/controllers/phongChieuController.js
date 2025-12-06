import PhongChieu from "../models/PhongChieu.js";
import Ghe from "../models/Ghe.js";
import { Op } from "sequelize";
import Rap from "../models/Rap.js";

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

/* =======================================
   1. LẤY DANH SÁCH PHÒNG CHIẾU
======================================= */
export const listPhongChieu = async (req, res) => {
  try {

    const maRap = req.query.maRap || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const offset = (page - 1) * limit;
    const whereOp = {
      ...(search && { tenPhong: { [Op.like]: `%${search}%` } }),
      ...(maRap && { maRap: maRap })
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

/* =======================================
   2. THÊM MỚI PHÒNG CHIẾU + GENERATE GHẾ
======================================= */
export const themMoiPhongChieu = async (req, res) => {
  const { maRap, tenPhong, tongSoGhe } = req.body;
  if (!maRap || !tenPhong || !tongSoGhe)
    return res.status(400).json({ message: "Vui lòng điền đầy đủ tất cả các trường" });

  try {
    // 1. tạo phòng
    const phong = await PhongChieu.create({ maRap, tenPhong, tongSoGhe });

    // 2. tạo seat
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

/* =======================================
   3. SỬA PHÒNG CHIẾU (TỰ CẬP NHẬT GHẾ)
======================================= */
export const suaPhongChieu = async (req, res) => {
  const { maPhong } = req.params;
  const { maRap, tenPhong, tongSoGhe } = req.body;

  try {
    const phong = await PhongChieu.findByPk(maPhong);
    if (!phong) return res.status(404).json({ message: "Không tìm thấy phòng" });

    const oldTotal = phong.tongSoGhe;

    // 1. update phòng
    await phong.update({
      maRap: maRap ?? phong.maRap,
      tenPhong: tenPhong ?? phong.tenPhong,
      tongSoGhe: tongSoGhe ?? phong.tongSoGhe,
    });

    // 2. nếu thay đổi tổng số ghế → update lại ghế
    if (tongSoGhe && tongSoGhe !== oldTotal) {
      await Ghe.destroy({ where: { maPhong } }); // xoá toàn bộ ghế
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

/* =======================================
   4. XOÁ PHÒNG CHIẾU (XÓA GHẾ TRƯỚC)
======================================= */
export const xoaPhongChieu = async (req, res) => {
  const { maPhong } = req.params;

  try {
    const phong = await PhongChieu.findByPk(maPhong);
    if (!phong) return res.status(404).json({ message: "Không tìm thấy phòng" });

    await Ghe.destroy({ where: { maPhong } });
    await PhongChieu.destroy({ where: { maPhong } });
    res.json({ message: "Xóa phòng chiếu + ghế thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi xóa phòng chiếu" });
  }
};
