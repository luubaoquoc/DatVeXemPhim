
import { dateFormat, VNPay } from 'vnpay'
import moment from 'moment-timezone'

const vnpay = new VNPay({
  tmnCode: '9QG49KG9',
  secureSecret: 'JXHN7ZWHDB30OV0I4DDRQJVAE77SD63A',
  vnpayHost: 'https://sandbox.vnpayment.vn',
  testMode: true,
})

export const createVNPayPayment = async (datVe, tongTien, req) => {
  const ipAddr =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket.remoteAddress ||
    '127.0.0.1'

  const createDate = moment()
    .tz('Asia/Ho_Chi_Minh')
    .format('YYYYMMDDHHmmss')

  const expireDate = moment()
    .tz('Asia/Ho_Chi_Minh')
    .add(15, 'minutes')
    .format('YYYYMMDDHHmmss')

  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: tongTien,
    vnp_IpAddr: ipAddr,
    vnp_TxnRef: datVe.maDatVe.toString(),
    vnp_OrderInfo: `Thanh toán vé xem phim - Mã ${datVe.maDatVe}`,
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
    vnp_Locale: 'vn',
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  })

  return paymentUrl
}

export const verifyVNPayReturn = (params) => {
  return vnpay.verifyReturnUrl(params)
}

