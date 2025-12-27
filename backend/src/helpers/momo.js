import crypto from 'crypto'
import axios from 'axios'

const createMoMoPayment = async (datVe, tongTien) => {
  const endpoint = "https://test-payment.momo.vn/v2/gateway/api/create"
  const partnerCode = "MOMO"
  const accessKey = "F8BBA842ECF85"
  const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"

  const orderId = `${datVe.maDatVe}_${Date.now()}`;
  const requestId = partnerCode + new Date().getTime()
  const orderInfo = "Thanh toán vé xem phim"
  const redirectUrl = process.env.CLIENT_URL + "/lich-su-dat-ve" || "http://localhost:5173/lich-su-dat-ve"
  const ipnUrl = process.env.CLIENT_URL + "/api/payment/momo-ipn" || "http://localhost:5000/api/payment/momo-ipn"
  const amount = String(Math.round(Number(tongTien) || 0))
  const requestType = "captureWallet"
  const extraData = ""

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`

  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex')


  const body = {
    partnerCode,
    accessKey,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    extraData,
    requestType,
    signature,
    lang: 'vi'
  }

  try {
    const response = await axios.post(endpoint, body, { headers: { 'Content-Type': 'application/json' } })
    console.log(' MoMo response:', response.data)
    return response.data?.payUrl // chính field này frontend cần
  } catch (error) {
    console.error(' MoMo API error:', error.response?.data || error.message)
    return null
  }
}

export default createMoMoPayment
