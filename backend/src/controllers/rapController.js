import Rap from "../models/Rap.js";
import { Op } from "sequelize";

/* =======================================
   LẤY DANH SÁCH RẠP (CÓ TÌM KIẾM + PHÂN TRANG)
======================================= */
export const getRaps = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const offset = (page - 1) * limit;

    const where = search
      ? { tenRap: { [Op.like]: `%${search}%` } }
      : {};

    const { count, rows } = await Rap.findAndCountAll({
      where,
      limit,
      offset,
      order: [["maRap", "ASC"]]
    });

    return res.json({
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy danh sách rạp" });
  }
};

/* =======================================
   LẤY 1 RẠP
======================================= */
export const getRapById = async (req, res) => {
  try {
    const { maRap } = req.params;
    const rap = await Rap.findByPk(maRap);

    if (!rap) return res.status(404).json({ message: "Không tìm thấy rạp" });

    res.json(rap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy thông tin rạp" });
  }
};

/* =======================================
   THÊM RẠP
======================================= */
export const createRap = async (req, res) => {
  try {
    const { tenRap, diaChi, soDienThoai } = req.body;

    if (!tenRap)
      return res.status(400).json({ message: "Tên rạp không được để trống" });

    const rap = await Rap.create({ tenRap, diaChi, soDienThoai });

    res.json({
      message: "Thêm rạp thành công",
      rap
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi thêm rạp" });
  }
};

/* =======================================
   SỬA RẠP
======================================= */
export const updateRap = async (req, res) => {
  try {
    const { maRap } = req.params;
    const { tenRap, diaChi, soDienThoai } = req.body;

    const rap = await Rap.findByPk(maRap);
    if (!rap) return res.status(404).json({ message: "Không tìm thấy rạp" });

    await rap.update({
      tenRap: tenRap ?? rap.tenRap,
      diaChi: diaChi ?? rap.diaChi,
      soDienThoai: soDienThoai ?? rap.soDienThoai,
    });

    res.json({
      message: "Cập nhật rạp thành công",
      rap
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi cập nhật rạp" });
  }
};

/* =======================================
   XÓA RẠP
======================================= */
export const deleteRap = async (req, res) => {
  try {
    const { maRap } = req.params;

    const rap = await Rap.findByPk(maRap);
    if (!rap) return res.status(404).json({ message: "Không tìm thấy rạp" });

    await rap.destroy();

    res.json({ message: "Xóa rạp thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi xóa rạp" });
  }
};
