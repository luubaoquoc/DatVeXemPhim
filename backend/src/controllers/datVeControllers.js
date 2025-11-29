import sequelize from '../configs/sequelize.js';
import createMoMoPayment from '../helpers/momo.js';
import createStripePayment from '../helpers/stripe.js';
import { createVNPayPayment } from '../helpers/VNPay.js';
import ChiTietDatVe from '../models/ChiTietDatVe.js';
import { DatVe, Ghe, Phim, PhongChieu, SuatChieu, TaiKhoan, ThanhToan } from '../models/index.js';
import { Op } from 'sequelize';




// GET /api/don-dat-ve
export const getAllDatVe = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const status = req.query.status || "";
    const toDate = req.query.toDate;

    const offset = (page - 1) * limit;

    // WHERE conditions
    let whereOp = {};

    // 🔍 Search theo maDatVe, tên phim, tên người đặt
    if (search) {
      whereOp = {
        [Op.or]: [
          { maDatVe: { [Op.like]: `%${search}%` } },
          // { '$suatChieu.phim.tenPhim$': { [Op.like]: `%${search}%` } },
          // { '$khachHang.hoTen$': { [Op.like]: `%${search}%` } },
        ]
      };
    }

    // 📅 Lọc theo ngày
    // if (fromDate && toDate) {
    //   whereOp.ngayDat = {
    //     [Op.between]: [new Date(fromDate), new Date(toDate)]
    //   };
    // }

    // 🟩 Lọc trạng thái
    if (status === "success") {
      whereOp.trangThai = "Thành công";
    } else if (status === "failed") {
      whereOp.trangThai = "Thất bại";
    }

    const totalItems = await DatVe.count({ where: whereOp });

    const datVes = await DatVe.findAll({
      where: whereOp,
      offset,
      limit,
      include: [
        {
          model: TaiKhoan,
          as: "khachHang",
          attributes: ["maTaiKhoan", "hoTen", "email"]
        },
        {
          model: SuatChieu,
          as: "suatChieu",
          include: [
            {
              model: Phim,
              as: "phim",
              attributes: ["maPhim", "tenPhim", "poster"]
            },
            {
              model: PhongChieu,
              as: "phongChieu",
              attributes: ["maPhong", "tenPhong"]
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

    //  Nếu chưa chọn phương thức thanh toán -> chỉ giữ ghế
    if (!phuongThuc) {
      await t.commit();
      return res.json({
        message: 'Đã giữ ghế. Hãy thanh toán trong thời hạn.',
        maDatVe: datVe.maDatVe,
        thoiHanThanhToan
      });
    }

    //  Chọn cổng thanh toán
    let redirectUrl;
    if (phuongThuc === 'momo')
      redirectUrl = await createMoMoPayment(datVe, tongTien);
    else if (phuongThuc === 'vnpay')
      redirectUrl = await createVNPayPayment(datVe, tongTien, req);
    else if (phuongThuc === 'stripe')
      redirectUrl = await createStripePayment(datVe, tongTien);

    await t.commit();

    return res.json({
      message: 'Tạo đơn đặt vé thành công',
      redirectUrl
    });

  } catch (err) {
    console.error(err);
    await t.rollback();
    return res.status(500).json({ message: 'Lỗi server' });
  }
};



// GET /api/datve/user  - list bookings of current user
export const listMyDatVes = async (req, res) => {
  try {
    const maTaiKhoan = req.user?.maTaiKhoan;
    if (!maTaiKhoan) return res.status(401).json({ message: 'Chưa xác thực' });
    const rows = await DatVe.findAll({
      where: { maTaiKhoanDatVe: maTaiKhoan },
      include: [
        {
          model: SuatChieu,
          as: 'suatChieu',
          include: [
            {
              model: Phim,
              as: 'phim',
            },
            {
              model: PhongChieu,
              as: 'phongChieu',
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
          attributes: ['maGhe'],
          include: [
            {
              model: Ghe,
              as: 'ghe',
            }
          ],
        }
      ],
      order: [['ngayDat', 'DESC']]
    });
    return res.json(rows);
  } catch (error) {
    console.error('listMyDatVes error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getGheDaDat = async (req, res) => {
  try {
    const maSuatChieu = Number(req.params.maSuatChieu);

    const rows = await ChiTietDatVe.findAll({
      include: [
        {
          model: DatVe,
          as: 'datVe', // alias đã define trong association
          where: {
            maSuatChieu,
            trangThai: { [Op.in]: ['Đang chờ', 'Đang thanh toán', 'Thành công'] }
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

// POST /api/datve/:maDatVe/checkout  - create payment redirect for an existing pending booking
export const createCheckoutForDatVe = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const maTaiKhoan = req.user?.maTaiKhoan;
    if (!maTaiKhoan) return res.status(401).json({ message: 'Chưa xác thực' });

    const maDatVe = Number(req.params.maDatVe);
    const { phuongThuc, tongTien } = req.body;
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
        thoiHanThanhToan: new Date(Date.now() + 5 * 60 * 1000)
      },
      { transaction: t }
    );

    // update or create payment record
    const thanhToan = await ThanhToan.findOne({ where: { maDatVe }, transaction: t, lock: t.LOCK.UPDATE });
    if (!thanhToan) {
      await t.rollback();
      return res.status(500).json({ message: 'Không tìm thấy bản ghi thanh toán' });
    }

    await thanhToan.update(
      {
        phuongThuc, soTien: tongTien || thanhToan.soTien,
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


// GET /api/datve/:maDatVe - get booking detail (owner or admin)
// export const getDatVe = async (req, res) => {
//   try {
//     const ma = Number(req.params.maDatVe);
//     if (!ma) return res.status(400).json({ message: 'maDatVe không hợp lệ' });
//     const datVe = await DatVe.findByPk(ma);
//     if (!datVe) return res.status(404).json({ message: 'Đặt vé không tồn tại' });
//     // check ownership
//     if (req.user.maTaiKhoan !== datVe.maTaiKhoan && req.user.maVaiTro !== 4) return res.status(403).json({ message: 'Không có quyền truy cập' });
//     const result = datVe.get({ plain: true });
//     // expose parsed seat labels as array for convenience
//     result.soGheList = result.soGhe ? String(result.soGhe).split(',').map(s => s.trim()).filter(Boolean) : [];
//     return res.json(result);
//   } catch (error) {
//     console.error('getDatVe error:', error);
//     return res.status(500).json({ message: 'Lỗi server' });
//   }
// };

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