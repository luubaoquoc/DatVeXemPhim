import puppeteer from "puppeteer"
import { Op, fn, col, literal } from "sequelize"
import {
  ThanhToan,
  DatVe,
  SuatChieu,
  PhongChieu,
  Rap,
  TaiKhoan,
  Phim
} from "../models/index.js"




// Lấy dữ liệu dashboard
export const getDashboardData = async (req, res) => {
  try {
    const { maVaiTro, maRap: maRapUser } = req.user
    const maRap = maVaiTro === 3 || maVaiTro === 2 ? maRapUser : req.query.maRap

    const doanhThuHomNay = await ThanhToan.findOne({
      attributes: [[fn("SUM", col("ThanhToan.soTien")), "tong"]],
      include: [{
        model: DatVe,
        as: "datVe",
        attributes: [],
        required: true,
        include: [{
          model: SuatChieu,
          as: "suatChieu",
          attributes: [],
          required: true,
          include: [{
            model: PhongChieu,
            as: "phongChieu",
            attributes: [],
            required: true,
            where: maRap ? { maRap } : {}
          }]
        }]
      }],
      where: {
        trangThai: "Thành công",
        [Op.and]: literal("DATE(ngayThanhToan) = CURDATE()")
      },
      raw: true
    })

    const doanhThu = doanhThuHomNay?.tong || 0


    const veBanHomNay = await DatVe.count({
      include: [{
        model: SuatChieu,
        as: "suatChieu",
        required: true,
        include: [{
          model: PhongChieu,
          as: "phongChieu",
          where: maRap ? { maRap } : {}
        }]
      }],
      where: {
        trangThai: "Thành công",
        [Op.and]: literal("DATE(ngayDat) = CURDATE()")
      }
    })


    const suatChieuHomNay = await SuatChieu.count({
      include: [{
        model: PhongChieu,
        as: "phongChieu",
        where: maRap ? { maRap } : {}
      }],
      where: literal("DATE(gioBatDau) = CURDATE()")
    })


    const userMoi = await TaiKhoan.count({
      where: literal("DATE(ngayTao) = CURDATE()")
    })

    // doanh thu 7 ngày
    const doanhThu7Ngay = await ThanhToan.findAll({
      attributes: [
        [fn("DATE", col("ngayThanhToan")), "ngay"],
        [fn("SUM", col("ThanhToan.soTien")), "tong"]
      ],
      include: [{
        model: DatVe,
        as: "datVe",
        attributes: [],
        required: true,
        include: [{
          model: SuatChieu,
          as: "suatChieu",
          attributes: [],
          required: true,
          include: [{
            model: PhongChieu,
            as: "phongChieu",
            attributes: [],
            where: maRap ? { maRap } : {}
          }]
        }]
      }],
      where: {
        trangThai: "Thành công",
        ngayThanhToan: {
          [Op.gte]: literal("DATE_SUB(CURDATE(), INTERVAL 6 DAY)")
        }
      },
      group: [literal("DATE(ngayThanhToan)")],
      order: literal("ngay ASC"),
      raw: true
    })


    // top phim tuần
    const topPhimTuan = await DatVe.findAll({
      attributes: [
        [col("suatChieu.phim.maPhim"), "maPhim"],
        [col("suatChieu.phim.tenPhim"), "tenPhim"],
        [col("suatChieu.phim.poster"), "poster"],
        [fn("COUNT", col("DatVe.maDatVe")), "soVe"],
        [fn("SUM", col("thanhToan.soTien")), "doanhThu"]
      ],
      include: [
        {
          model: ThanhToan,
          as: "thanhToan",
          attributes: [],
          where: { trangThai: "Thành công" }
        },
        {
          model: SuatChieu,
          as: "suatChieu",
          required: true,
          attributes: [],
          include: [
            {
              model: Phim,
              as: "phim",
              required: true,
              attributes: []
            },
            {
              model: PhongChieu,
              as: "phongChieu",
              required: true,
              attributes: [],
              where: maRap ? { maRap } : {}
            }
          ]
        }],
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
    })


    res.json({
      cards: {
        doanhThu,
        veBanHomNay,
        suatChieuHomNay,
        userMoi
      },
      doanhThu7Ngay,
      topPhimTuan
    })

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Lỗi server dashboard" })
  }
}

// filter dashboard
export const filterDashboard = async (req, res) => {
  try {
    const { type, from, to, month, year } = req.query
    const { maVaiTro, maRap: maRapUser } = req.user
    const maRap = maVaiTro === 2 || maVaiTro === 3 ? maRapUser : req.query.maRap

    const includeRap = [{
      model: DatVe,
      as: "datVe",
      required: true,
      attributes: [],
      include: [{
        model: SuatChieu,
        as: "suatChieu",
        attributes: [],
        required: true,
        include: [{
          model: PhongChieu,
          as: "phongChieu",
          attributes: [],
          required: true,
          where: maRap ? { maRap } : {}
        }]
      }]
    }]

    let start, end, attributes, group

    if (type === "date") {
      start = new Date(from)
      end = new Date(to)
      attributes = [[fn("DATE", col("ngayThanhToan")), "label"]]
      group = [literal("DATE(ngayThanhToan)")]
    }

    if (type === "month") {
      start = new Date(year, month - 1, 1)
      end = new Date(year, month, 0, 23, 59, 59)
      attributes = [[fn("DATE", col("ngayThanhToan")), "label"]]
      group = [literal("DATE(ngayThanhToan)")]
    }

    if (type === "year") {
      start = new Date(year, 0, 1)
      end = new Date(year, 11, 31, 23, 59, 59)
      attributes = [[fn("DATE_FORMAT", col("ngayThanhToan"), "%Y-%m"), "label"]]
      group = [literal("DATE_FORMAT(ngayThanhToan, '%Y-%m')")]
    }

    const data = await ThanhToan.findAll({
      attributes: [
        ...attributes,
        [fn("SUM", col("soTien")), "tong"]
      ],
      include: includeRap,
      where: {
        trangThai: "Thành công",
        ngayThanhToan: { [Op.between]: [start, end] }
      },
      group,
      order: literal("label ASC"),
      raw: true
    })

    // top phim
    const topPhim = await DatVe.findAll({
      attributes: [
        [col("suatChieu.phim.maPhim"), "maPhim"],
        [col("suatChieu.phim.tenPhim"), "tenPhim"],
        [col("suatChieu.phim.poster"), "poster"],
        [fn("COUNT", col("DatVe.maDatVe")), "soVe"],
        [fn("SUM", col("thanhToan.soTien")), "doanhThu"]
      ],
      include: [
        {
          model: ThanhToan,
          as: "thanhToan",
          attributes: [],
          required: true,
          where: { trangThai: "Thành công" }
        },
        {
          model: SuatChieu,
          as: "suatChieu",
          required: true,
          attributes: [],
          include: [
            {
              model: Phim,
              as: "phim",
              required: true,
              attributes: []
            },
            {
              model: PhongChieu,
              as: "phongChieu",
              required: true,
              attributes: [],
              where: maRap ? { maRap } : {}
            }
          ]
        }
      ],
      where: {
        trangThai: "Thành công",
        ngayDat: { [Op.between]: [start, end] }
      },
      group: ["suatChieu.phim.maPhim",
        "suatChieu.phim.tenPhim",
        "suatChieu.phim.poster"
      ],
      order: [[fn("SUM", col("thanhToan.soTien")), "DESC"]],
      limit: 5,
      subQuery: false,
      raw: true
    });

    res.json({ data, topPhim })

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Lỗi filter dashboard" })
  }
}
