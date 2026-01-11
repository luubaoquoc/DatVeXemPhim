import KhuyenMai from "../models/KhuyenMai.js";
import LichSuDungMa from "../models/LichSuDungMa.js";
import sequelize from "../configs/sequelize.js";
import { Op } from "sequelize";


// kiểm tra mã khuyến mãi
export const kiemTraMaKhuyenMai = async (req, res) => {
  try {

    const { maTaiKhoan } = req.user;
    const { maKhuyenMai, tongTien } = req.body;

    const km = await KhuyenMai.findOne({
      where: { maKhuyenMai },
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const ngayBatDau = new Date(km.ngayBatDau);
    ngayBatDau.setHours(0, 0, 0, 0);

    const ngayHetHan = new Date(km.ngayHetHan);
    ngayHetHan.setHours(23, 59, 59, 999);
    if (!km) {
      return res.status(400).json({ message: "Mã khuyến mãi không tồn tại" });
    }


    //  Chưa tới ngày bắt đầu
    if (now < ngayBatDau) {
      return res.status(400).json({ message: "Mã khuyến mãi chưa bắt đầu" });
    }

    //  Trạng thái
    if (!km.trangThai || ngayHetHan < now) {
      return res.status(400).json({ message: "Mã khuyến mãi đã hết hạn" });
    }


    //  Hết lượt sử dụng
    if (km.soLuotSuDung <= 0) {
      return res.status(400).json({ message: "Mã khuyến mãi đã hết lượt sử dụng" });
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



// lấy danh sách khuyến mãi
export const getDanhSachKhuyenMai = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const trangThai = req.query.trangThai || "";
    const offset = (page - 1) * limit;

    const whereOp = {
      ...(search && { maKhuyenMai: { [Op.like]: `%${search}%` } }),
      ...(trangThai === "chua_bat_dau" && { ngayBatDau: { [Op.gt]: new Date() } }),
      ...(trangThai === "dang_ap_dung" && {
        ngayBatDau: { [Op.lte]: new Date() },
        ngayHetHan: { [Op.gt]: new Date() },
      }),
      ...(trangThai === "het_han" && { ngayHetHan: { [Op.lte]: new Date() } }),
    };

    const totalItems = await KhuyenMai.count({ where: whereOp });

    const rows = await KhuyenMai.findAll({
      where: whereOp,
      order: [["id", "DESC"]],
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    res.json({
      data: rows,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách khuyến mãi" });
  }
};


// tạo khuyến mãi
export const taoKhuyenMai = async (req, res) => {
  try {
    const {
      maKhuyenMai,
      loaiGiamGia,
      giaTriGiamGia,
      giamToiDa,
      giaTriDonToiThieu,
      soLuotSuDung,
      ngayBatDau,
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
      ngayBatDau,
      ngayHetHan,
      trangThai
    });

    res.json(km);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo khuyến mãi" });
  }
};

// cập nhật khuyến mãi
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

// xoá khuyến mãi
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

