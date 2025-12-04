import { Op, fn, col, literal } from "sequelize";
import ThanhToan from "../models/ThanhToan.js";
import DatVe from "../models/DatVe.js";
import SuatChieu from "../models/SuatChieu.js";
import TaiKhoan from "../models/TaiKhoan.js";
import Phim from "../models/Phim.js";

// ==========================================
// 1. API DASHBOARD MẶC ĐỊNH
// ==========================================
export const getDashboardData = async (req, res) => {
  try {
    // ----------------- 1. CARDS -----------------

    // Doanh thu hôm nay
    const doanhThuHomNay = await ThanhToan.sum("soTien", {
      where: {
        trangThai: "Thành công",
        [Op.and]: literal("DATE(ngayThanhToan) = CURDATE()")
      }
    }) || 0;

    // Vé bán hôm nay
    const veBanHomNay = await DatVe.count({
      where: {
        trangThai: "Thành công",
        [Op.and]: literal("DATE(ngayDat) = CURDATE()")
      }
    });

    // Suất chiếu hôm nay
    const suatChieuHomNay = await SuatChieu.count({
      where: literal("DATE(gioBatDau) = CURDATE()")
    });

    // Người dùng mới hôm nay
    const userMoi = await TaiKhoan.count({
      where: literal("DATE(ngayTao) = CURDATE()")
    });

    // ----------------- 2. DOANH THU 7 NGÀY -----------------
    const doanhThu7Ngay = await ThanhToan.findAll({
      attributes: [
        [fn("DATE", col("ngayThanhToan")), "ngay"],
        [fn("SUM", col("soTien")), "tong"],
      ],
      where: {
        trangThai: "Thành công",
        [Op.and]: literal("ngayThanhToan >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)")
      },
      group: [literal("DATE(ngayThanhToan)")],
      order: literal("ngay ASC"),
    });

    // ----------------- 3. TOP PHIM TUẦN -----------------
    const topPhimTuan = await DatVe.findAll({
      attributes: [
        [col("suatChieu.phim.maPhim"), "maPhim"],
        [col("suatChieu.phim.tenPhim"), "tenPhim"],
        [col("suatChieu.phim.poster"), "poster"],
        [fn("COUNT", col("DatVe.maDatVe")), "soVe"]
      ],
      include: [
        {
          model: SuatChieu,
          as: "suatChieu",
          attributes: [],
          include: [
            {
              model: Phim,
              as: "phim",
              attributes: []
            }
          ]
        }
      ],
      where: {
        trangThai: "Thành công",
        ngayDat: {
          [Op.gte]: literal("DATE_SUB(CURDATE(), INTERVAL 7 DAY)")
        }
      },
      group: ["suatChieu.phim.maPhim"],
      order: [[fn("COUNT", col("DatVe.maDatVe")), "DESC"]],
      limit: 5,
      raw: true
    });


    // ----------------- 4. DOANH THU 12 THÁNG -----------------
    const doanhThuTheoThang = await ThanhToan.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("ngayThanhToan"), "%Y-%m"), "thang"],
        [fn("SUM", col("soTien")), "tong"],
      ],
      where: {
        trangThai: "Thành công",
        [Op.and]: literal("ngayThanhToan >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)")
      },
      group: [literal("DATE_FORMAT(ngayThanhToan, '%Y-%m')")],
      order: literal("thang ASC"),
    });

    // Trả về frontend
    res.json({
      cards: {
        doanhThuHomNay,
        veBanHomNay,
        suatChieuHomNay,
        userMoi
      },
      doanhThu7Ngay,
      doanhThuTheoThang,
      topPhimTuan
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


// ==========================================
// 2. API FILTER DASHBOARD (tùy chọn)
// ==========================================
export const filterDashboard = async (req, res) => {
  try {
    const { type, from, to, month, year } = req.query;
    let start, end;
    let results = [];

    // ----- 1. Lọc theo ngày tùy chọn -----
    if (type === "date") {
      start = new Date(from);
      start.setHours(0, 0, 0, 0);

      end = new Date(to);
      end.setHours(23, 59, 59, 999);

      results = await ThanhToan.findAll({
        attributes: [
          [fn("DATE", col("ngayThanhToan")), "label"],
          [fn("SUM", col("soTien")), "tong"],
        ],
        where: {
          trangThai: "Thành công",
          ngayThanhToan: { [Op.between]: [start, end] },
        },
        group: [literal("DATE(ngayThanhToan)")],
        order: literal("label ASC"),
      });
    }

    // ----- 2. Lọc theo tháng -----
    if (type === "month") {
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0, 23, 59, 59);

      results = await ThanhToan.findAll({
        attributes: [
          [fn("DATE", col("ngayThanhToan")), "label"],
          [fn("SUM", col("soTien")), "tong"],
        ],
        where: {
          trangThai: "Thành công",
          ngayThanhToan: {
            [Op.between]: [start, end],
          },
        },
        group: [literal("DATE(ngayThanhToan)")],
        order: literal("label ASC"),
      });
    }

    // ----- 3. Lọc theo năm -----
    if (type === "year") {
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31, 23, 59, 59);

      results = await ThanhToan.findAll({
        attributes: [
          [fn("DATE_FORMAT", col("ngayThanhToan"), "%Y-%m"), "label"],
          [fn("SUM", col("soTien")), "tong"],
        ],
        where: {
          trangThai: "Thành công",
          ngayThanhToan: { [Op.between]: [start, end] },
        },
        group: [literal("DATE_FORMAT(ngayThanhToan, '%Y-%m')")],
        order: literal("label ASC"),
      });
    }

    return res.json({
      data: results,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Lỗi server filter" });
  }
};

