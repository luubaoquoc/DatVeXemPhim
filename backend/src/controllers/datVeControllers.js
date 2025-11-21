import sequelize from '../configs/sequelize.js';
import createMoMoPayment from '../helpers/momo.js';
import createStripePayment from '../helpers/stripe.js';
import { createVNPayPayment } from '../helpers/VNPay.js';
import { DatVe, Phim, PhongChieu, SuatChieu, ThanhToan } from '../models/index.js';




// POST /api/datve    body: { maSuatChieu, chiTiet: ["A1","A2"] or chiTiet: [{ soGhe: 'A1', giaBan }, ...], tongTien }
export const createDatVe = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const maTaiKhoan = req.user?.maTaiKhoan;
    if (!maTaiKhoan) return res.status(401).json({ message: 'Chưa xác thực' });

    const { maSuatChieu, chiTiet, tongTien, phuongThuc } = req.body;

    let seatLabels = [];
    if (Array.isArray(chiTiet) && chiTiet.length > 0) {
      if (typeof chiTiet[0] === 'string') seatLabels = chiTiet;
      else if (typeof chiTiet[0] === 'object') seatLabels = chiTiet.map(i => i.soGhe || i.maGhe);
    }
    seatLabels = seatLabels.filter(Boolean);
    if (!maSuatChieu || seatLabels.length === 0)
      return res.status(400).json({ message: 'Dữ liệu đặt vé không hợp lệ' });

    //  Bước 1: Lấy tất cả các ghế đã được đặt cho suất chiếu này (đang chờ hoặc thành công)
    const existing = await DatVe.findAll({
      where: {
        maSuatChieu,
        trangThai: ['Đang chờ', 'Thành công'],
      },
      attributes: ['soGhe'],
      transaction: t,
      lock: t.LOCK.UPDATE, // khóa hàng trong transaction
    });

    // Gộp lại thành danh sách ghế đang bị chiếm
    const booked = existing
      .flatMap(v => String(v.soGhe).split(',').map(s => s.trim()))
      .filter(Boolean);

    // Kiểm tra trùng
    const conflict = seatLabels.filter(s => booked.includes(s));
    if (conflict.length > 0) {
      await t.rollback();
      return res.status(409).json({
        message: `Các ghế ${conflict.join(', ')} đã có người đặt!`,
      });
    }

    const thoihanThanhToan = new Date(Date.now() + 5 * 60 * 1000);

    // 🟩 Bước 2: Tạo đặt vé mới (lưu trạng thái 'Đang chờ' và tạo bản ghi thanh toán - có hoặc không có phuongThuc)
    const newDatVe = await DatVe.create({
      maTaiKhoanDatVe: maTaiKhoan,
      maSuatChieu,
      ngayDat: new Date(),
      tongTien: tongTien || 0,
      trangThai: 'Đang chờ',
      soGhe: seatLabels.join(','),
      thoiHanThanhToan: thoihanThanhToan,
    }, { transaction: t });

    const thanhToan = await ThanhToan.create({
      maDatVe: newDatVe.maDatVe,
      phuongThuc: phuongThuc || null,
      soTien: tongTien,
      ngayThanhToan: new Date(),
      trangThai: 'Chờ xử lý',
    }, { transaction: t });

    // Nếu không cung cấp phuongThuc -> chỉ tạo đặt vé (đang chờ) và trả về dữ liệu đặt vé (không gọi cổng thanh toán)
    if (!phuongThuc) {
      await t.commit();
      return res.status(200).json({
        message: 'Đặt vé đã được lưu tạm thời (Đang chờ). Vui lòng thực hiện thanh toán trong thời gian giữ ghế.',
        maDatVe: newDatVe.maDatVe,
        thoiHanThanhToan: newDatVe.thoiHanThanhToan,
      });
    }

    // 🟦 Bước 3: Nếu có phuongThuc -> gọi cổng thanh toán ngay như trước
    let redirectUrl;
    if (phuongThuc === 'momo') redirectUrl = await createMoMoPayment(newDatVe, tongTien);
    else if (phuongThuc === 'vnpay') redirectUrl = await createVNPayPayment(newDatVe, tongTien, req);
    else if (phuongThuc === 'stripe') redirectUrl = await createStripePayment(newDatVe, tongTien);

    if (!redirectUrl) throw new Error('Không tạo được URL thanh toán');

    await t.commit();
    return res.status(200).json({
      message: 'Tạo đơn đặt vé thành công, chuyển sang cổng thanh toán...',
      redirectUrl,
    });

  } catch (error) {
    console.error('createDatVe error:', error);
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
              as: 'phim'
            },
            {
              model: PhongChieu,
              as: 'phongChieu'
            }
          ]
        },
        {
          model: ThanhToan,
          as: 'thanhToan'
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
    if (!maSuatChieu) {
      return res.status(400).json({ message: 'Mã suất chiếu không hợp lệ' });
    }

    // Lấy tất cả đặt vé có cùng mã suất chiếu và không bị hủy/thất bại
    const datVes = await DatVe.findAll({
      where: {
        maSuatChieu,
        trangThai: ['Đang chờ', 'Thành công'] // tùy bạn muốn include trạng thái nào
      },
      attributes: ['soGhe']
    });

    // Gộp danh sách ghế
    const gheDaDat = datVes
      .flatMap(v => String(v.soGhe).split(',').map(s => s.trim()))
      .filter(Boolean);

    return res.json({ maSuatChieu, gheDaDat });
  } catch (error) {
    console.error('getGheDaDat error:', error);
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
    if (datVe.thoiHanThanhToan && new Date(datVe.thoiHanThanhToan) < new Date()) {
      await t.rollback();
      return res.status(400).json({ message: 'Thời gian giữ ghế đã hết' });
    }

    // update or create payment record
    const thanhToan = await ThanhToan.findOne({ where: { maDatVe }, transaction: t, lock: t.LOCK.UPDATE });
    if (!thanhToan) {
      await t.rollback();
      return res.status(500).json({ message: 'Không tìm thấy bản ghi thanh toán' });
    }

    await thanhToan.update({ phuongThuc, soTien: tongTien || thanhToan.soTien, ngayThanhToan: new Date(), trangThai: 'Chờ xử lý' }, { transaction: t });

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
export const getDatVe = async (req, res) => {
  try {
    const ma = Number(req.params.maDatVe);
    if (!ma) return res.status(400).json({ message: 'maDatVe không hợp lệ' });
    const datVe = await DatVe.findByPk(ma);
    if (!datVe) return res.status(404).json({ message: 'Đặt vé không tồn tại' });
    // check ownership
    if (req.user.maTaiKhoan !== datVe.maTaiKhoan && req.user.maVaiTro !== 4) return res.status(403).json({ message: 'Không có quyền truy cập' });
    const result = datVe.get({ plain: true });
    // expose parsed seat labels as array for convenience
    result.soGheList = result.soGhe ? String(result.soGhe).split(',').map(s => s.trim()).filter(Boolean) : [];
    return res.json(result);
  } catch (error) {
    console.error('getDatVe error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// PUT /api/datve/:maDatVe/status (admin only) - update status
export const updateDatVeStatus = async (req, res) => {
  try {
    const ma = Number(req.params.maDatVe);
    const { trangThai } = req.body;
    if (!ma || !trangThai) return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    const datVe = await DatVe.findByPk(ma);
    if (!datVe) return res.status(404).json({ message: 'Đặt vé không tồn tại' });
    await datVe.update({ trangThai });
    return res.json({ message: 'Cập nhật trạng thái thành công', datVe });
  } catch (error) {
    console.error('updateDatVeStatus error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};
