import { verifyVNPayReturn } from '../helpers/VNPay.js';
import sequelize from '../configs/sequelize.js';
import ChiTietDatVe from '../models/ChiTietDatVe.js';
import { DatVe, Ghe, Phim, PhongChieu, Rap, SuatChieu, TaiKhoan, ThanhToan } from '../models/index.js';
import { sendVerificationEmail } from '../utils/sendEmail.js';
/**
 *  MoMo IPN callback
 */
export const momoIPN = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { orderId, resultCode } = req.body;

    const datVe = await DatVe.findOne({ where: { maDatVe: orderId }, transaction: t });
    if (!datVe) {
      await t.rollback();
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt vé' });
    }

    const thanhToan = await ThanhToan.findOne({ where: { maDatVe: orderId }, transaction: t });
    if (!thanhToan) {
      await t.rollback();
      return res.status(404).json({ message: 'Không tìm thấy thông tin thanh toán' });
    }

    const trangThai = resultCode === 0 ? 'Thành công' : 'Thất bại';
    const ctTrangThai = resultCode === 0 ? 'Đã thanh toán' : 'Thất bại';

    // Update tất cả trong transaction
    await datVe.update({ trangThai }, { transaction: t });
    await thanhToan.update({ trangThai }, { transaction: t });
    await ChiTietDatVe.update(
      { trangThai: ctTrangThai },
      { where: { maDatVe: orderId }, transaction: t }
    );

    await t.commit();

    return res.status(200).json({ message: 'MoMo IPN xử lý thành công' });
  } catch (error) {
    await t.rollback();
    console.error('momoIPN error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 *  VNPay return callback
 */
export const createVNPay = async (req, res) => {
  try {
    const { datVe, tongTien } = req.body
    const paymentUrl = await createVNPayPayment(datVe, tongTien, req)
    return res.json({ redirectUrl: paymentUrl })
  } catch (error) {
    console.error('createVNPay error:', error)
    res.status(500).json({ message: 'Không tạo được link thanh toán VNPay' })
  }
}

//  Xử lý callback từ VNPay
export const vnpayReturn = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const params = req.query
    const isValid = verifyVNPayReturn(params)

    if (!isValid) {
      console.error(' Sai chữ ký trả về VNPay:', params)
      return res.status(400).json({ message: 'Sai chữ ký trả về VNPay' })
    }

    const orderId = params.vnp_TxnRef
    const vnp_ResponseCode = params.vnp_ResponseCode

    const datVe = await DatVe.findOne({
      where: { maDatVe: orderId },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!datVe) {
      await t.rollback();
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt vé' });
    }

    const thanhToan = await ThanhToan.findOne({
      where: { maDatVe: orderId },
      transaction: t
    });

    const success = params.vnp_ResponseCode === "00";

    await datVe.update({ trangThai: success ? "Thành công" : "Thất bại" }, { transaction: t });
    await thanhToan.update({ trangThai: success ? "Thành công" : "Thất bại" }, { transaction: t });
    await ChiTietDatVe.update(
      { trangThai: success ? "Đã thanh toán" : "Thất bại" },
      { where: { maDatVe: orderId }, transaction: t }
    );

    await t.commit();

    // 2. Lấy thông tin vé để gửi mail – KHÔNG LOCK
    const fullOrder = await DatVe.findOne({
      where: { maDatVe: orderId },
      include: [
        {
          model: TaiKhoan,
          as: 'khachHang',
          attributes: ['email']
        },
        {
          model: SuatChieu,
          as: 'suatChieu',
          include: [{
            model: Phim,
            as: 'phim',
            attributes: ['tenPhim']
          },
          {
            model: PhongChieu,
            as: 'phongChieu',
            include: [
              {
                model: Rap,
                as: 'rap',
                attributes: ['tenRap']
              }
            ],
            attributes: ['tenPhong']
          }
          ],
          attributes: ['gioBatDau']
        },
        {
          model: ChiTietDatVe,
          as: 'chiTietDatVes',
          attributes: ['maGhe'],
          include: [
            {
              model: Ghe,
              as: 'ghe',
              attributes: ['hang', 'soGhe']
            }
          ]
        }
      ]
    });
    const tenPhim = fullOrder?.suatChieu?.phim?.tenPhim || 'Không xác định';
    const tenRap = fullOrder?.suatChieu?.phongChieu?.rap?.tenRap || 'Không xác định';
    const tenPhong = fullOrder?.suatChieu?.phongChieu?.tenPhong || 'Không xác định';
    const gioBatDau = fullOrder?.suatChieu?.gioBatDau || 'Không xác định';
    const soGhe = fullOrder?.chiTietDatVes?.map(ct => `${ct.ghe.hang}${ct.ghe.soGhe}`).join(', ') || 'Chưa chọn';

    // Gửi email vé cho khách
    await sendVerificationEmail({
      to: fullOrder?.khachHang?.email,
      subject: `Xác nhận vé xem phim #${orderId}`,
      html: `
          <h2>Thanh toán thành công!</h2>
          <p>Cảm ơn bạn đã đặt vé tại hệ thống của chúng tôi.</p>
          <p>Mã đặt vé: <b>${orderId}</b></p>
          <p><b>Phim:</b> ${tenPhim}</p>
          <p><b>Rạp:</b> ${tenRap}</p>
          <p><b>Phòng:</b> ${tenPhong}</p>
          <p><b>Suất chiếu:</b> ${gioBatDau}</p>
          <p><b>Ghế:</b> ${soGhe}</p>
          <p><b>Tổng tiền:</b> ${(Number(params.vnp_Amount) / 100).toLocaleString('vi-VN')} VND</p>
          <p><b>Thời gian thanh toán:</b> ${(params.vnp_PayDate).toLocaleString('vi-VN')}</p>
        `
    })


    //  Redirect về frontend
    return res.redirect(`http://localhost:5173/lich-su-dat-ve?status=${vnp_ResponseCode}`)
  } catch (error) {
    await t.rollback();
    console.error('vnpayReturn error:', error)
    return res.status(500).json({ message: 'Lỗi xử lý callback VNPay' })
  }
}

/**
 *  Stripe webhook
 */
export const stripeWebhook = async (req, res) => {
  try {
    const event = req.body;
    const orderId = event.data?.object?.metadata?.orderId;

    if (!orderId) return res.status(400).json({ message: 'Thiếu mã đơn hàng' });

    const datVe = await DatVe.findOne({ where: { maDatVe: orderId } });
    const thanhToan = await ThanhToan.findOne({ where: { maDatVe: orderId } });

    if (event.type === 'checkout.session.completed') {
      await datVe.update({ trangThai: 'Thành công' });
      await thanhToan.update({ trangThai: 'Thành công' });
    } else if (event.type === 'checkout.session.expired') {
      await datVe.update({ trangThai: 'Thất bại' });
      await thanhToan.update({ trangThai: 'Thất bại' });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('stripeWebhook error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};
