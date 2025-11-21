import { verifyVNPayReturn } from '../helpers/VNPay.js';
import { DatVe, Phim, PhongChieu, Rap, SuatChieu, TaiKhoan, ThanhToan } from '../models/index.js';
import { sendVerificationEmail } from '../utils/sendEmail.js';
/**
 * ✅ MoMo IPN callback
 */
export const momoIPN = async (req, res) => {
  try {
    const { orderId, resultCode } = req.body;

    const datVe = await DatVe.findOne({ where: { maDatVe: orderId } });
    if (!datVe) return res.status(404).json({ message: 'Không tìm thấy đơn đặt vé' });

    const thanhToan = await ThanhToan.findOne({ where: { maDatVe: orderId } });

    if (resultCode === 0) {
      await datVe.update({ trangThai: 'Thành công' });
      await thanhToan.update({ trangThai: 'Thành công' });
    } else {
      await datVe.update({ trangThai: 'Thất bại' });
      await thanhToan.update({ trangThai: 'Thất bại' });
    }

    return res.status(200).json({ message: 'MoMo IPN xử lý thành công' });
  } catch (error) {
    console.error('momoIPN error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * ✅ VNPay return callback
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

// ✅ Xử lý callback từ VNPay
export const vnpayReturn = async (req, res) => {
  try {
    const params = req.query
    const isValid = verifyVNPayReturn(params)

    if (!isValid) {
      console.error('❌ Sai chữ ký trả về VNPay:', params)
      return res.status(400).json({ message: 'Sai chữ ký trả về VNPay' })
    }

    const orderId = params.vnp_TxnRef
    const vnp_ResponseCode = params.vnp_ResponseCode

    const datVe = await DatVe.findOne({
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
        }
      ]
    })

    const tenPhim = datVe?.suatChieu?.phim?.tenPhim || 'Không xác định';
    const tenRap = datVe?.suatChieu?.phongChieu?.rap?.tenRap || 'Không xác định';
    const tenPhong = datVe?.suatChieu?.phongChieu?.tenPhong || 'Không xác định';
    const gioBatDau = datVe?.suatChieu?.gioBatDau || 'Không xác định';
    const soGhe = datVe?.soGhe || 'Chưa chọn';
    const thanhToan = await ThanhToan.findOne({ where: { maDatVe: orderId } })

    if (!datVe || !thanhToan) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt vé' })
    }

    if (vnp_ResponseCode === '00') {
      await datVe.update({ trangThai: 'Thành công' })
      await thanhToan.update({ trangThai: 'Thành công' })

      // 🎫 Gửi email vé cho khách
      await sendVerificationEmail({
        to: datVe?.khachHang?.email,
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
          <p><b>Thời gian thanh toán:</b> ${params.vnp_PayDate}</p>
        `
      })
    } else {
      await datVe.update({ trangThai: 'Thất bại' })
      await thanhToan.update({ trangThai: 'Thất bại' })
    }

    // 👉 Redirect về frontend
    return res.redirect(`http://localhost:5173/lich-su-dat-ve?status=${vnp_ResponseCode}`)
  } catch (error) {
    console.error('vnpayReturn error:', error)
    return res.status(500).json({ message: 'Lỗi xử lý callback VNPay' })
  }
}

/**
 * ✅ Stripe webhook
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
