import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useApi from '../hooks/useApi'
import momo from '../assets/vi-momo.jpg'
import vnpay from '../assets/vnpay.png'
import ThongoTinDatVe from '../components/ThongTinDatVe'

const ThanhToan = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [promo, setPromo] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('momo')
  const [timeLeft, setTimeLeft] = useState(() => {
    // nếu được truyền thoiHanThanhToan từ server -> tính khoảng thời gian còn lại
    try {
      if (state?.thoiHanThanhToan) {
        const diff = Math.floor((new Date(state.thoiHanThanhToan).getTime() - Date.now()) / 1000)
        return Math.max(0, diff)
      }
    } catch {
      console.log('lỗi');

    }
    return 5 * 60 * 1000
  });
  const api = useApi(true)

  const { maSuatChieu, date, selectedSeats = [], pricePerSeat = 0, movie = {} } = state

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          toast.error('Đã hết thời gian giữ ghế! Vui lòng chọn lại.')
          navigate(`/chon-ghe/${maSuatChieu}`)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate, maSuatChieu, date, movie.maPhim])


  if (!state) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">Trang thanh toán</h2>
        <p>Không có dữ liệu thanh toán. Vui lòng chọn ghế trước khi tới trang này.</p>
      </div>
    )
  }

  const total = (selectedSeats.length || 0) * (pricePerSeat || 0)

  const handleApplyPromo = () => {
    if (!promo) return toast.error('Vui lòng nhập mã khuyến mãi')
    toast.success(`Áp dụng mã ${promo} thành công (demo)`)
  }

  const handleConfirm = async () => {
    try {
      const phuongThuc = selectedMethod.toLowerCase()

      // Nếu đã có maDatVe (được tạo khi giữ chỗ) -> gọi checkout endpoint để tạo redirectUrl cho booking hiện tại
      if (state?.maDatVe) {
        const res = await api.post(`/datve/${state.maDatVe}/checkout`, { phuongThuc, tongTien: total })
        if (res.data?.redirectUrl) {
          window.location.href = res.data.redirectUrl
          return
        }
        toast.error(res.data?.message || 'Không thể tạo link thanh toán')
        return
      }

      // fallback: tạo đặt vé và thanh toán cùng lúc (cũ)
      const payload = {
        maSuatChieu,
        chiTiet: selectedSeats,
        tongTien: total,
        phuongThuc
      }
      const res = await api.post('/datve', payload)
      if (res.data.redirectUrl) {
        window.location.href = res.data.redirectUrl // 👉 chuyển sang trang thanh toán
      } else {
        toast.success(res.data?.message || 'Đặt vé thành công')
        navigate('/lich-su-dat-ve')
      }
    } catch (err) {
      console.error(err)
      const msg = err?.response?.data?.message || 'Đặt vé thất bại'
      toast.error(msg)
    }
  }



  return (
    <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-40 '>
      <div className="flex-2 shadow p-6 bg-primary/10 border border-primary/20 rounded-lg">
        <h2 className="text-2xl font-semibold mb-6">Khuyến mãi</h2>
        <div className="flex gap-3 mb-2">
          <input
            type="text"
            placeholder="Mã khuyến mãi"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full outline-none focus:border-primary"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
          />
          <button
            onClick={handleApplyPromo}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition"
          >
            Áp dụng
          </button>
        </div>


        <h2 className="text-2xl font-semibold my-6">Phương thức thanh toán</h2>
        <div className="space-y-4">
          {[
            {
              id: 'momo',
              name: 'MoMo',
              desc: 'Thanh toán qua ví điện tử MoMo nhanh chóng.',
              logo: { src: momo, alt: 'MoMo' }
            },
            {
              id: 'vnpay',
              name: 'VNPay',
              desc: 'Thanh toán bằng QR ngân hàng nội địa.',
              logo: { src: vnpay, alt: 'VNPay' }
            },
            {
              id: 'stripe',
              name: 'Stripe',
              desc: 'Thanh toán quốc tế (Visa / MasterCard).',
              logo: '/assets/images/payment/stripe.png'
            }
          ].map((method) => (
            <label
              key={method.id}
              className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition ${selectedMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'
                }`}
            >
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={() => setSelectedMethod(method.id)}
              />
              <img src={method.logo.src} alt={method.name} className="w-12 h-8 object-contain" />
              <div>
                <p className="font-medium">{method.name}</p>
                <p className="text-sm text-gray-500">{method.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-6">
          (*) Bằng việc click vào <b>Thanh toán</b>, bạn đã đồng ý với các Quy định giao dịch trực tuyến của rạp.
        </p>
      </div>
      <div className='flex flex-1 justify-center md:justify-end mt-10 md:mt-0'>
        <ThongoTinDatVe
          phim={state.phim}
          phong={state.phong}
          rap={state.phong?.rap}
          poster={state.poster}
          seats={state.seats || []}
          selectedSeats={state.selectedSeats}
          selectedTime={state.gioBatDau}
          date={state.gioBatDau}
          giaVeCoBan={state.pricePerSeat}
          timeLeft={timeLeft}
          onBack={() => navigate(-1)}
          onAction={handleConfirm}
          actionLabel="Xác nhận thanh toán"
        />
      </div>
    </div>

  )
}

export default ThanhToan
