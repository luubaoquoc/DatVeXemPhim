import e from 'express';
import sequelize from '../configs/sequelize.js';
import createMoMoPayment from '../helpers/momo.js';
import createStripePayment from '../helpers/stripe.js';
import { createVNPayPayment } from '../helpers/VNPay.js';
import ChiTietDatVe from '../models/ChiTietDatVe.js';
import { DatVe, Ghe, Phim, PhongChieu, Rap, SuatChieu, TaiKhoan, ThanhToan } from '../models/index.js';
import { Op } from 'sequelize';
import { xoaVeHetHan } from '../crons/xoaVeHetHan.js';




// GET /api/don-dat-ve
export const getAllDatVe = async (req, res) => {
  try {

    const { maVaiTro, maRap } = req.user || {};

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const status = req.query.status || "";

    const offset = (page - 1) * limit;

    let phongWhere = undefined;

    if (maVaiTro === 3 || maVaiTro === 2) {
      if (!maRap) {
        return res.status(403).json({ message: "Tài khoản chưa gán rạp" });
      }
      phongWhere = { maRap };
    }
    // WHERE conditions
    let whereOp = {};

    //  Search theo maDatVe, tên phim, tên người đặt
    if (search) {
      whereOp = {
        [Op.or]: [
          { maDatVe: { [Op.like]: `%${search}%` } },
        ]
      };
    }



    //  Lọc trạng thái
    if (status === "success") {
      whereOp.trangThai = "Thành công";
    } else if (status === "failed") {
      whereOp.trangThai = "Thất bại";
    }

    const totalItems = await DatVe.count({
      where: whereOp,
      include: [
        {
          model: SuatChieu,
          as: "suatChieu",
          required: true,
          include: [
            {
              model: PhongChieu,
              as: "phongChieu",
              required: true,
              ...(phongWhere && { where: phongWhere })
            }
          ]
        }
      ],
      distinct: true
    });

    const datVes = await DatVe.findAll({
      where: whereOp,
      offset,
      limit,
      include: [
        {
          model: TaiKhoan,
          as: "khachHang",
          attributes: ["maTaiKhoan", "hoTen"]
        },
        {
          model: TaiKhoan,
          as: "nhanVien",
          attributes: ["maTaiKhoan", "hoTen", "maVaiTro"]
        },
        {
          model: SuatChieu,
          as: "suatChieu",
          required: true,
          attributes: ["maSuatChieu", "gioBatDau", "gioKetThuc"],
          include: [
            {
              model: Phim,
              as: "phim",
              required: true,
              attributes: ["maPhim", "tenPhim", "poster"]
            },
            {
              model: PhongChieu,
              as: "phongChieu",
              required: true,
              attributes: ["maPhong", "tenPhong", "maRap"],
              ...(phongWhere ? { where: phongWhere } : {}),
              include: [
                {
                  model: Rap,
                  as: 'rap',
                  attributes: ['maRap', 'tenRap', 'diaChi']
                }]
            }
          ]
        },
        {
          model: ChiTietDatVe,
          as: "chiTietDatVes",
          include: [{ model: Ghe, as: "ghe" }]
        },
        {
          model: ThanhToan,
          as: "thanhToan"
        }
      ],
      order: [["ngayDat", "DESC"]]
    });

    res.json({
      data: datVes,
      currentPage: page,
      totalItems,
      totalPages: Math.ceil(totalItems / limit)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};



// POST /api/datve    body: { maSuatChieu, chiTiet: ["A1","A2"] or chiTiet: [{ soGhe: 'A1', giaBan }, ...], tongTien }
export const createDatVe = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const maTaiKhoan = req.user?.maTaiKhoan;
    if (!maTaiKhoan) return res.status(401).json({ message: 'Chưa xác thực' });

    const { maSuatChieu, chiTiet, tongTien, phuongThuc } = req.body;

    if (!maSuatChieu || !Array.isArray(chiTiet) || chiTiet.length === 0)
      return res.status(400).json({ message: 'Dữ liệu đặt vé không hợp lệ' });

    // Format: chiTiet = [{ maGhe, giaVe }, ...]
    const maGheList = chiTiet.map(g => g.maGhe);
    console.log(maGheList);


    await xoaVeHetHan(maSuatChieu);

    //  1. Check ghế đã có người giữ chưa
    const conflict = await ChiTietDatVe.findAll({
      where: {
        maGhe: maGheList,
      },
      include: {
        model: DatVe,
        as: 'datVe',
        where: {
          maSuatChieu,
          trangThai: { [Op.in]: ['Đang chờ', 'Thành công'] }
        }
      },
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    if (conflict.length > 0) {
      await t.rollback();
      const gheLoi = conflict.map(c => c.maGhe);
      return res.status(409).json({
        message: `Ghế ${gheLoi.join(', ')} đã có người đặt`
      });
    }

    const thoiHanThanhToan = new Date(Date.now() + 5 * 60 * 1000);

    //  2. Tạo DatVe
    const datVe = await DatVe.create({
      maTaiKhoanDatVe: maTaiKhoan,
      maSuatChieu,
      tongTien,
      tongSoGhe: chiTiet.length,
      trangThai: 'Đang chờ',
      thoiHanThanhToan
    }, { transaction: t });

    //  3. Lưu ChiTietDatVe
    const ct = chiTiet.map(g => ({
      maDatVe: datVe.maDatVe,
      maGhe: g.maGhe,
      giaVe: g.giaVe,
    }));

    await ChiTietDatVe.bulkCreate(ct, { transaction: t });

    //  4. Tạo bản ghi thanh toán
    const thanhToan = await ThanhToan.create({
      maDatVe: datVe.maDatVe,
      phuongThuc: phuongThuc || null,
      soTien: tongTien,
      ngayThanhToan: new Date(),
      trangThai: 'Chờ xử lý',
    }, { transaction: t });

    await t.commit();

    return res.json({
      message: 'Giữ ghế thành công',
      maDatVe: datVe.maDatVe,
      thoiHanThanhToan: datVe.thoiHanThanhToan,
    });

  } catch (err) {
    console.error(err);
    await t.rollback();
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// POST /api/datve/:maDatVe/checkout  - create payment redirect for an existing pending booking
export const createCheckoutForDatVe = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const maTaiKhoan = req.user?.maTaiKhoan;
    if (!maTaiKhoan) return res.status(401).json({ message: 'Chưa xác thực' });

    const maDatVe = Number(req.params.maDatVe);
    const { phuongThuc, tongTien, khuyenMaiId } = req.body;
    if (!maDatVe || !phuongThuc) return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });

    // load booking with lock
    const datVe = await DatVe.findByPk(maDatVe, { transaction: t, lock: t.LOCK.UPDATE });
    if (!datVe) {
      await t.rollback();
      return res.status(404).json({ message: 'Đặt vé không tồn tại' });
    }
    // ownership check
    if (datVe.maTaiKhoanDatVe !== maTaiKhoan) {
      await t.rollback();
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    // must be pending and not expired
    if (datVe.trangThai !== 'Đang chờ') {
      await t.rollback();
      return res.status(400).json({ message: 'Đặt vé không ở trạng thái đang chờ' });
    }
    if (new Date(datVe.thoiHanThanhToan) < new Date()) {
      await datVe.update({ trangThai: 'Đã hủy' }, { transaction: t });
      await t.commit();
      return res.status(400).json({ message: 'Thời gian giữ ghế đã hết' });
    }

    await datVe.update(
      {
        trangThai: 'Đang thanh toán',
        tongTien,
        maKhuyenMaiId: khuyenMaiId || null,
        ngayDat: new Date(),
        thoiHanThanhToan: new Date(Date.now() + 5 * 60 * 1000)
      },
      { transaction: t }
    );

    // update or create payment record
    const thanhToan = await ThanhToan.findOne({
      where: { maDatVe },
      transaction: t,
      lock: t.LOCK.UPDATE
    });
    if (!thanhToan) {
      await t.rollback();
      return res.status(500).json({ message: 'Không tìm thấy bản ghi thanh toán' });
    }

    await thanhToan.update(
      {
        phuongThuc,
        soTien: tongTien,
        ngayThanhToan: new Date(),
        trangThai: 'Đang thanh toán'
      },
      { transaction: t });

    // call payment provider
    let redirectUrl;
    if (phuongThuc === 'momo') redirectUrl = await createMoMoPayment(datVe, thanhToan.soTien);
    else if (phuongThuc === 'vnpay') redirectUrl = await createVNPayPayment(datVe, thanhToan.soTien, req);
    else if (phuongThuc === 'stripe') redirectUrl = await createStripePayment(datVe, thanhToan.soTien);

    if (!redirectUrl) {
      await t.rollback();
      return res.status(500).json({ message: 'Không tạo được URL thanh toán' });
    }

    await t.commit();
    return res.json({ message: 'Tạo URL thanh toán thành công', redirectUrl });
  } catch (error) {
    console.error('createCheckoutForDatVe error:', error);
    await t.rollback();
    return res.status(500).json({ message: 'Lỗi server' });
  }
};



// GET /api/datve/user  - list bookings of current user
export const listMyDatVes = async (req, res) => {
  try {
    const maTaiKhoan = req.user?.maTaiKhoan;
    if (!maTaiKhoan) return res.status(401).json({ message: 'Chưa xác thực' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const offset = (page - 1) * limit;

    const datveConditions = {
      [Op.or]: [
        { maTaiKhoanDatVe: maTaiKhoan },
        { maNhanVienBanVe: maTaiKhoan }
      ]
    };

    const searchCondition = search ? {
      maDatVe: { [Op.like]: `%${search}%` }
    } : {};

    const totalItems = await DatVe.count({
      where: {
        ...datveConditions,
        ...searchCondition
      },
    });


    const rows = await DatVe.findAll({
      where: {
        ...datveConditions,
        ...searchCondition
      },
      include: [
        {
          model: SuatChieu,
          as: 'suatChieu',
          attributes: ['maSuatChieu', 'gioBatDau', 'gioKetThuc', 'giaVeCoBan'],
          include: [
            {
              model: Phim,
              as: 'phim',
              attributes: ['maPhim', 'tenPhim', 'poster']
            },
            {
              model: PhongChieu,
              as: 'phongChieu',
              attributes: ['maPhong', 'tenPhong', 'maRap'],
              include: [{ model: Rap, as: 'rap', attributes: ['maRap', 'tenRap', 'diaChi'] }]
            }
          ]
        },
        {
          model: ThanhToan,
          as: 'thanhToan',
        },
        {
          model: ChiTietDatVe,
          as: 'chiTietDatVes',
          include: [
            {
              model: Ghe,
              as: 'ghe',
            }
          ],
        }
      ],
      offset,
      limit,
      order: [['ngayDat', 'DESC']]
    });
    return res.json({
      data: rows,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (error) {
    console.error('listMyDatVes error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getGheDangDat = async (req, res) => {
  const maDatVe = Number(req.params.maDatVe);

  const rows = await ChiTietDatVe.findAll({
    where: { maDatVe },
    include: [{ model: Ghe, as: 'ghe' }]
  });

  const seats = rows.map(r => `${r.ghe.hang}${r.ghe.soGhe}`);

  res.json(seats);
};

export const getGheDaDat = async (req, res) => {
  try {
    const maSuatChieu = Number(req.params.maSuatChieu);
    const maDatVe = req.query.maDatVe ? Number(req.query.maDatVe) : null;

    await xoaVeHetHan(maSuatChieu);

    const rows = await ChiTietDatVe.findAll({
      include: [
        {
          model: DatVe,
          as: 'datVe', // alias đã define trong association
          where: {
            maSuatChieu,
            trangThai: { [Op.in]: ['Đang chờ', 'Đang thanh toán', 'Thành công'] },
            [Op.or]: [
              { trangThai: 'Thanh công' },
              { thoiHanThanhToan: { [Op.gt]: new Date() } },
            ],
            ...(maDatVe ? { maDatVe: { [Op.ne]: maDatVe } } : {}) // exclude current booking if maDatVe provided
          },
          attributes: []
        },
        {
          model: Ghe,
          as: 'ghe', // alias bạn đặt trong association ChiTietDatVe -> Ghe
          attributes: ['hang', 'soGhe']
        }
      ],
      attributes: ['maGhe'] // vẫn lấy maGhe để tham chiếu
    });


    const gheDaDat = rows.map(r => {
      const g = r.ghe;
      return g ? `${g.hang}${g.soGhe}`.toUpperCase() : null;
    }).filter(Boolean);

    return res.json({
      maSuatChieu,
      gheDaDat
    });

  } catch (e) {
    console.error(">>> LỖI getGheDaDat:", e);
    return res.status(500).json({ message: 'Lỗi server', error: e.message });
  }
};

export const capNhatGheDangDat = async (req, res) => {
  const { seats } = req.body;
  const maDatVe = req.params.maDatVe;

  await ChiTietDatVe.destroy({ where: { maDatVe } });

  await ChiTietDatVe.bulkCreate(
    seats.map(s => ({
      maDatVe,
      maGhe: s.maGhe,
      giaVe: s.giaVe
    }))
  );

  res.json({ message: 'Cập nhật ghế thành công' });
};




// GET /api/datve/:maDatVe - get booking detail (owner or admin)
export const getDatVe = async (req, res) => {
  try {
    const maDatVe = Number(req.params.maDatVe)
    if (!maDatVe) {
      return res.status(400).json({ message: 'maDatVe không hợp lệ' })
    }

    const datVe = await DatVe.findOne({
      where: { maDatVe },
      include: [
        {
          model: SuatChieu,
          as: 'suatChieu',
          include: [
            { model: Phim, as: 'phim' },
            {
              model: PhongChieu,
              as: 'phongChieu',
              include: [{ model: Rap, as: 'rap' }]
            }
          ]
        },
        {
          model: ChiTietDatVe,
          as: 'chiTietDatVes',
          include: [{ model: Ghe, as: 'ghe' }]
        },
        {
          model: ThanhToan,
          as: 'thanhToan'
        }
      ]
    })

    if (!datVe) {
      return res.status(404).json({ message: 'Đặt vé không tồn tại' })
    }

    // kiểm tra quyền
    if (
      datVe.maTaiKhoanDatVe !== req.user.maTaiKhoan &&
      req.user.maVaiTro !== 4
    ) {
      return res.status(403).json({ message: 'Không có quyền truy cập' })
    }

    return res.json(datVe)
  } catch (error) {
    console.error('getDatVe error:', error)
    return res.status(500).json({ message: 'Lỗi server' })
  }
}


export const deleteDatVe = async (req, res) => {
  try {
    const maDatVe = Number(req.params.maDatVe);
    if (!maDatVe) return res.status(400).json({ message: 'maDatVe không hợp lệ' });
    const datVe = await DatVe.findByPk(maDatVe);
    if (!datVe) return res.status(404).json({ message: 'Đặt vé không tồn tại' });
    await datVe.destroy();
    return res.json({ message: 'Đã xóa đặt vé' });
  } catch (error) {
    console.error('deleteDatVe error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};


export const getThongTinDatVe = async (req, res) => {
  const maChiTiet = Number(req.params.maChiTiet);
  console.log(maChiTiet);


  try {
    const Ve = await ChiTietDatVe.findOne({
      where: { maChiTiet },
      include: [
        {
          model: DatVe,
          as: 'datVe',
          include: [
            {
              model: SuatChieu,
              as: 'suatChieu',
              include: [
                { model: Phim, as: 'phim' },
                { model: PhongChieu, as: 'phongChieu', include: [{ model: Rap, as: 'rap' }] }
              ]
            },
          ]
        },
        {
          model: Ghe,
          as: 'ghe'
        }
      ]
    });

    //  Không tìm thấy mã đặt vé
    if (!Ve) {
      return res.status(404).json({ message: "Không tìm thấy vé" });
    }

    //  Vé chưa thanh toán
    if (Ve.trangThai !== "Đã thanh toán" && Ve.trangThai !== "Đã check-in") {
      return res.status(400).json({ message: "Vé chưa thanh toán thành công" });
    }

    //  OK → trả về thông tin vé
    return res.json(Ve);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server", error });
  }
};



export const checkInDatVe = async (req, res) => {
  try {
    const maChiTiet = Number(req.params.maChiTiet);
    if (!maChiTiet) return res.status(400).json({ message: 'Mã đặt vé không hợp lệ' });

    const datVe = await ChiTietDatVe.findByPk(maChiTiet);

    if (!datVe) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt vé' });
    }

    if (datVe.trangThai !== "Đã thanh toán") {
      return res.status(400).json({ message: 'Vé chưa thanh toán thành công, không thể check-in' });
    }

    await datVe.update({ trangThai: 'Đã check-in' });

    return res.json({ message: 'Check-in thành công', datVe });

  } catch (error) {
    console.error("checkInDatVe error:", error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};


export const BanVeTaiQuay = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const maTaiKhoan = req.user?.maTaiKhoan;
    if (!maTaiKhoan) return res.status(401).json({ message: 'Chưa xác thực' });
    const { maSuatChieu, seats } = req.body;
    console.log(req.body);


    if (!maSuatChieu || !Array.isArray(seats) || seats.length === 0)
      return res.status(400).json({ message: 'Dữ liệu đặt vé không hợp lệ' });
    // Format: seats = [{ maGhe, giaVe }, ...]
    const maGheList = seats?.map(g => g.maGhe);

    console.log(maGheList);

    //  1. Check ghế đã có người giữ chưa
    const conflict = await ChiTietDatVe.findAll({
      where: {
        maGhe: maGheList,
      },
      include: {
        model: DatVe,
        as: 'datVe',
        where: {
          maSuatChieu,
          trangThai: { [Op.in]: ['Đang chờ', 'Thành công'] }
        }
      },
      lock: t.LOCK.UPDATE,
      transaction: t
    });
    if (conflict.length > 0) {
      await t.rollback();
      const gheLoi = conflict.map(c => c.maGhe);
      return res.status(409).json({
        message: `Ghế ${gheLoi.join(', ')} đã có người đặt`
      });
    }
    const tongTien = seats.reduce((sum, g) => sum + (g.giaVe || 0), 0);

    //  2. Tạo DatVe
    const datVe = await DatVe.create({
      maNhanVienBanVe: maTaiKhoan,
      maSuatChieu,
      tongTien,
      tongSoGhe: seats.length,
      trangThai: 'Thành công',
      thoiHanThanhToan: null
    }, { transaction: t });
    //  3. Lưu ChiTietDatVe
    const ct = seats.map(g => ({
      maDatVe: datVe.maDatVe,
      maGhe: g.maGhe,
      giaVe: g.giaVe,
      trangThai: 'Đã thanh toán'
    }));
    await ChiTietDatVe.bulkCreate(ct, { transaction: t });
    //  4. Tạo bản ghi thanh toán
    await ThanhToan.create({
      maDatVe: datVe.maDatVe,
      phuongThuc: 'Tại quầy',
      soTien: tongTien,
      ngayThanhToan: new Date(),
      trangThai: 'Thành công',
    }, { transaction: t });

    const booking = await DatVe.findOne({
      where: { maDatVe: datVe.maDatVe },
      include: [
        {
          model: SuatChieu,
          as: "suatChieu",
          attributes: ["maSuatChieu", "gioBatDau", "gioKetThuc"],
          include: [
            { model: Phim, as: "phim", attributes: ['maPhim', 'tenPhim', 'poster'] },
            { model: PhongChieu, as: "phongChieu", attributes: ['maPhong', 'tenPhong', 'maRap'], include: [{ model: Rap, as: "rap", attributes: ['maRap', 'tenRap', 'diaChi'] }] }
          ]
        },
        {
          model: ChiTietDatVe,
          as: "chiTietDatVes",
          include: [{ model: Ghe, as: "ghe" }]
        }
      ],
      transaction: t
    });

    await t.commit();
    return res.json(booking);
  } catch (err) {
    console.error(err);
    await t.rollback();
    return res.status(500).json({ message: 'Lỗi server' });
  }
};
