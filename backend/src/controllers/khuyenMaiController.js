import KhuyenMai from "../models/KhuyenMai.js";
import LichSuDungMa from "../models/LichSuDungMa.js";
import sequelize from "../configs/sequelize.js";
import { Op } from "sequelize";

export const kiemTraMaKhuyenMai = async (req, res) => {
  try {

    const { maTaiKhoan } = req.user;
    const { maKhuyenMai, tongTien } = req.body;



    const km = await KhuyenMai.findOne({
      where: {
        maKhuyenMai,
        trangThai: true,
        ngayHetHan: { [Op.gt]: new Date() },
        soLuotSuDung: { [Op.gt]: 0 },
      },
    });

    if (!km) {
      return res.status(400).json({ message: "Mã khuyến mãi không hợp lệ hoặc đã hết hạn" });
    }

    const daSuDung = await LichSuDungMa.findOne({
      where: {
        maTaiKhoan,
        maKhuyenMaiId: km.id,
      },
    });

    if (daSuDung) {
      return res
        .status(400)
        .json({ message: "Mã khuyến mãi đã được sử dụng" });
    }

    if (tongTien < km.giaTriDonToiThieu) {
      return res.status(400).json({
        message: `Đơn hàng tối thiểu ${km.giaTriDonToiThieu.toLocaleString()} VNĐ`,
      });
    }

    let soTienGiam = 0;

    if (km.loaiGiamGia === "PHAN_TRAM") {
      soTienGiam = Math.floor((tongTien * km.giaTriGiamGia) / 100);
      if (km.giamToiDa && soTienGiam > km.giamToiDa) {
        soTienGiam = km.giamToiDa;
      }
    } else {
      soTienGiam = km.giaTriGiamGia;
    }

    res.json({
      soTienGiam,
      tongTienSauGiam: tongTien - soTienGiam,
      khuyenMaiId: km.id,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};



//2. DANH SÁCH (ADMIN)
export const getDanhSachKhuyenMai = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const { rows, count } = await KhuyenMai.findAndCountAll({
      where: {
        maKhuyenMai: { [Op.like]: `%${search}%` }
      },
      order: [["id", "DESC"]],
      limit: Number(limit),
      offset
    });

    res.json({
      data: rows,
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách khuyến mãi" });
  }
};

/* =========================
   3. TẠO KHUYẾN MÃI
========================= */
export const taoKhuyenMai = async (req, res) => {
  try {
    const {
      maKhuyenMai,
      loaiGiamGia,
      giaTriGiamGia,
      giamToiDa,
      giaTriDonToiThieu,
      soLuotSuDung,
      ngayHetHan,
      trangThai
    } = req.body;

    const exists = await KhuyenMai.findOne({ where: { maKhuyenMai } });
    if (exists) {
      return res.status(400).json({ message: "Mã khuyến mãi đã tồn tại" });
    }

    const km = await KhuyenMai.create({
      maKhuyenMai,
      loaiGiamGia,
      giaTriGiamGia,
      giamToiDa,
      giaTriDonToiThieu,
      soLuotSuDung,
      ngayHetHan,
      trangThai
    });

    res.json(km);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo khuyến mãi" });
  }
};

/* =========================
   4. CẬP NHẬT
========================= */
export const capNhatKhuyenMai = async (req, res) => {
  try {
    const { id } = req.params;

    const km = await KhuyenMai.findByPk(id);
    if (!km) {
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
    }

    await km.update(req.body);
    res.json(km);
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật khuyến mãi" });
  }
};

/* =========================
   5. XOÁ
========================= */
export const xoaKhuyenMai = async (req, res) => {
  try {
    const { id } = req.params;

    const km = await KhuyenMai.findByPk(id);
    if (!km) {
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
    }

    await km.destroy();
    res.json({ message: "Xoá khuyến mãi thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xoá khuyến mãi" });
  }
};

