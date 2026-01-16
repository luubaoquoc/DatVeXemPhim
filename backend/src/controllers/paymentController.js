import { verifyVNPayReturn } from '../helpers/VNPay.js';
import sequelize from '../configs/sequelize.js';
import ChiTietDatVe from '../models/ChiTietDatVe.js';
import { ComBoDoAn, DatVe, Ghe, KhuyenMai, LichSuDungMa, Phim, PhongChieu, Rap, SuatChieu, TaiKhoan, ThanhToan } from '../models/index.js';
import { sendVerificationEmail } from '../utils/sendEmail.js';
import { Op } from 'sequelize';
import { stripe } from '../helpers/stripe.js';


const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Tạo thanh toán MoMo
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

// Tạo thanh toán VNPay
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
  const params = req.query
  const orderId = params.vnp_TxnRef
  const vnp_ResponseCode = params.vnp_ResponseCode
  const success = params.vnp_ResponseCode === "00";
  try {
    const isValid = verifyVNPayReturn(params)

    if (!isValid) {
      console.error(' Sai chữ ký trả về VNPay:', params)
      return res.status(400).json({ message: 'Sai chữ ký trả về VNPay' })
    }


    const datVe = await DatVe.findOne({
      where: { maDatVe: orderId },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!datVe) {
      await t.rollback();
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt vé hoặc đã hết hạn' });
    }

    const thanhToan = await ThanhToan.findOne({
      where: { maDatVe: orderId },
      transaction: t
    });



    await datVe.update({ trangThai: success ? "Thành công" : "Thất bại" }, { transaction: t });
    await thanhToan.update({ trangThai: success ? "Thành công" : "Thất bại" }, { transaction: t });
    await ChiTietDatVe.update(
      { trangThai: success ? "Đã thanh toán" : "Thất bại" },
      { where: { maDatVe: orderId }, transaction: t }
    );

    if (success && datVe.maKhuyenMaiId) {
      // 1. Giảm số lượt sử dụng mã
      await KhuyenMai.update(
        {
          soLuotSuDung: sequelize.literal('soLuotSuDung - 1')
        },
        {
          where: {
            id: datVe.maKhuyenMaiId,
            soLuotSuDung: { [Op.gt]: 0 }
          },
          transaction: t
        }
      );

      // 2. Ghi lịch sử sử dụng mã
      await LichSuDungMa.create(
        {
          maTaiKhoan: datVe.maTaiKhoanDatVe,
          maKhuyenMaiId: datVe.maKhuyenMaiId,
          ngaySuDung: new Date()
        },
        { transaction: t }
      );
    }

    await t.commit();

  } catch (error) {
    await t.rollback();
    console.error('vnpayReturn error:', error)
    return res.status(500).json({ message: 'Lỗi xử lý callback VNPay' })
  }

  // 2. Lấy thông tin vé để gửi mail – KHÔNG LOCK
  try {
    const fullOrder = await DatVe.findOne({
      where: { maDatVe: orderId },
      include: [
        {
          model: TaiKhoan,
          as: 'khachHang',
          attributes: ['hoTen','email', 'soDienThoai']
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
        },
        {
          model: ComBoDoAn,
          through: { attributes: ['soLuong', 'giaTaiThoiDiem'] },
          attributes: ['tenCombo', 'moTa']
        }
      ]
    });
    const tenPhim = fullOrder?.suatChieu?.phim?.tenPhim || 'Không xác định';
    const tenRap = fullOrder?.suatChieu?.phongChieu?.rap?.tenRap || 'Không xác định';
    const tenPhong = fullOrder?.suatChieu?.phongChieu?.tenPhong || 'Không xác định';
    const gioBatDau = fullOrder?.suatChieu?.gioBatDau || 'Không xác định';
    const soGhe = fullOrder?.chiTietDatVes?.map(ct => `${ct.ghe.hang}${ct.ghe.soGhe}`).join(', ') || 'Chưa chọn';
    const combo = fullOrder?.ComBoDoAns || [];
    const comboStr = combo.map(c => `${c.tenCombo} (x${c.DonDatVeCombo.soLuong})`).join(', ');
    const tenKhachHang = fullOrder?.khachHang?.hoTen || 'Khách vãng lai';
    const soDienThoai = fullOrder?.khachHang?.soDienThoai || 'N/A';
    const email = fullOrder?.khachHang?.email || 'N/A';


    

    // Gửi email vé cho khách
    await sendVerificationEmail({
      to: fullOrder?.khachHang?.email,
      subject: `Xác nhận vé xem phim #${orderId}`,
      html: `
          <h2>Thanh toán thành công!</h2>
          <p>Cảm ơn bạn đã đặt vé tại hệ thống của chúng tôi.</p>
          <p>Mã đặt vé: <b>${orderId}</b></p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${orderId}" />
          <p><b>Phim:</b> ${tenPhim}</p>
          <p><b>Rạp:</b> ${tenRap}</p>
          <p><b>Phòng:</b> ${tenPhong}</p>
          <p><b>Suất chiếu:</b> ${gioBatDau}</p>
          <p><b>Ghế:</b> ${soGhe}</p>
          <p><b>Thức ăn kèm:</b> ${comboStr || 'Không có'}</p>
          <p><b>Tổng tiền:</b> ${(Number(params.vnp_Amount) / 100).toLocaleString('vi-VN')} VND</p>
          <p><b>Thời gian thanh toán:</b> ${(params.vnp_PayDate).toLocaleString('vi-VN')}</p>
          <div>
          <p><b>Khách hàng:</b> ${tenKhachHang}</p>
          <p><b>Số điện thoại:</b> ${soDienThoai}</p>
          <p><b>Email:</b> ${email}</p>
          </div>
          <div>
          <p>Xin vui lòng mang theo mã vé hoặc email xác nhận này khi đến rạp để được phục vụ.</p>
          <p>Chúc bạn có những trải nghiệm xem phim tuyệt vời!</p>
          </div>
          <div>
          <h3>Chính sách hoàn/hủy</h3>
          <p>- Vé đã mua không thể hoàn hoặc hủy trừ khi suất chiếu bị hủy bởi rạp.</p>
          <p>- Vui lòng đến rạp ít nhất 15 phút trước giờ chiếu để đảm bảo quyền lợi của bạn.</p>
          <p>- Mọi thắc mắc xin liên hệ bộ phận chăm sóc khách hàng của chúng tôi.</p>
          </div>
          `
    })


    //  Redirect về frontend
  } catch (error) {
    console.error('vnpayReturn email error:', error);
  }
  if (success) {
    return res.redirect(`${CLIENT_URL}/dat-ve-thanh-cong?status=${vnp_ResponseCode}&maDatVe=${orderId}`);
  } else {
    return res.redirect(`${CLIENT_URL}/lich-su-dat-ve?status=${vnp_ResponseCode}&maDatVe=${orderId}`);
  }
};


// Xử lý webhook từ Stripe
export const stripeWebhook = async (req, res) => {
  console.log(' Stripe webhook received');

  const sig = req.headers['stripe-signature'];
  let event;
  try {

    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

  } catch (error) {
    console.error(' Stripe signature verification failed:', error.message);
    return res.status(400).send('Webhook Error');
  }

  const session = event.data.object;

  const orderId = session.metadata?.orderId;

  if (!orderId) {
    return res.status(400).json({ message: 'Không tìm thấy orderId trong metadata' });
  }

  const datVe = await DatVe.findOne({ where: { maDatVe: orderId } });
  if (!datVe) {
    return res.status(404).json({ message: 'Không tìm thấy đơn đặt vé' });
  }
  const thanhToan = await ThanhToan.findOne({ where: { maDatVe: orderId } });
  if (!thanhToan) {
    return res.status(404).json({ message: 'Không tìm thấy thông tin thanh toán' });
  }
  if (event.type === 'checkout.session.completed') {
    // Payment is successful
    await datVe.update({ trangThai: 'Thành công' });
    await thanhToan.update({ trangThai: 'Thành công' });
    await ChiTietDatVe.update(
      { trangThai: 'Đã thanh toán' },
      { where: { maDatVe: orderId } }
    );

    // 2. Lấy thông tin vé để gửi mail – KHÔNG LOCK
    try {
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
      const tongTien = session.amount_total;
      const thoiGianThanhToan = new Date(session.created * 1000);


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
          <p><b>Tổng tiền:</b> ${(Number(tongTien) / 100).toLocaleString('vi-VN')} VND</p>
          <p><b>Thời gian thanh toán:</b> ${thoiGianThanhToan.toLocaleString('vi-VN')}</p>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${orderId}" />
          `
      })
    } catch (error) {
      console.error('stripeWebhook email error:', error);
    }
  } else if (event.type === 'checkout.session.expired') {
    // thanh toán thất bại hoặc hết hạn
    await datVe.update({ trangThai: 'Thất bại' });
    await thanhToan.update({ trangThai: 'Thất bại' });
    await ChiTietDatVe.update(
      { trangThai: 'Thất bại' },
      { where: { maDatVe: orderId } }
    );
  }

  res.status(200).json({ received: true });

};
