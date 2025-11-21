
import { VNPay } from 'vnpay'

const vnpay = new VNPay({
  tmnCode: '9QG49KG9',
  secureSecret: 'JXHN7ZWHDB30OV0I4DDRQJVAE77SD63A',
  vnpayHost: 'https://sandbox.vnpayment.vn',
  testMode: true,
})

export const createVNPayPayment = async (datVe, tongTien, req) => {
  const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'

  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: tongTien,
    vnp_IpAddr: ipAddr,
    vnp_TxnRef: datVe.maDatVe.toString(),
    vnp_OrderInfo: `Thanh toán vé xem phim ${datVe.maDatVe}`,
    vnp_ReturnUrl: 'http://localhost:5000/api/payment/vnpay-return',
    vnp_Locale: 'vn',
  })

  return paymentUrl
}

export const verifyVNPayReturn = (params) => {
  return vnpay.verifyReturnUrl(params)
}

