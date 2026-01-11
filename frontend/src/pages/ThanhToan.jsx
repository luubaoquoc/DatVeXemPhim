import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useApi from '../hooks/useApi'
import momo from '../assets/vi-momo.jpg'
import vnpay from '../assets/vnpay.png'
import ThongTinDatVe from '../components/ThongTinDatVe'
import XacNhanTuoiModal from '../components/XacNhanTuoiModal'

const AGE_RULES = {
  P: {
    age: 0,
    message: null
  },
  T13: {
    age: 13,
    message: 'Tôi xác nhận mua vé phim này cho người có độ tuổi từ 13 tuổi trở lên và đồng ý cung cấp giấy tờ tuỳ thân để xác minh độ tuổi.'
  },
  T16: {
    age: 16,
    message: 'Tôi xác nhận mua vé phim này cho người có độ tuổi từ 16 tuổi trở lên và đồng ý cung cấp giấy tờ tuỳ thân để xác minh độ tuổi.'
  },
  C18: {
    age: 18,
    message: 'Tôi xác nhận mua vé phim này cho người có độ tuổi từ 18 tuổi trở lên và đồng ý cung cấp giấy tờ tuỳ thân để xác minh độ tuổi.'
  }
}


const ThanhToan = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { maSuatChieu, selectedSeats = [], pricePerSeat = 0, phim } = state
  const api = useApi(true)

  console.log('maSuatChieu', maSuatChieu);
  console.log('selectedSeats', selectedSeats);
  console.log('pricePerSeat', pricePerSeat);
  console.log('phim', phim);





  const [promo, setPromo] = useState('')
  const [discount, setDiscount] = useState(0)
  const [khuyenMaiId, setKhuyenMaiId] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState('vnpay')
  const [timeLeft, setTimeLeft] = useState(null);
  const [selectedCombos, setSelectedCombos] = useState([])

  const [showAgeModal, setShowAgeModal] = useState(false)
  const [ageMessage, setAgeMessage] = useState('')

  const [loading, setLoading] = useState(false)

  const comboTotal = selectedCombos.reduce(
    (sum, c) => sum + c.soLuong * c.giaTaiThoiDiem,
    0
  );
  const seatTotal =
    selectedSeats.length * pricePerSeat;



  const total = seatTotal + comboTotal;
  const [finalTotal, setFinalTotal] = useState(total)
  useEffect(() => {
    setDiscount(0);
    setFinalTotal(total);
    setKhuyenMaiId(null);
  }, [total]);

  useEffect(() => {
    if (!state?.maDatVe) return;

    const fetchBooking = async () => {
      try {
        const res = await api.get(`/datve/${state.maDatVe}`);

        const expireTime = new Date(res.data.thoiHanThanhToan).getTime();
        const now = Date.now();

        const diff = Math.floor((expireTime - now) / 1000);
        setTimeLeft(Math.max(0, diff));
      } catch (err) {
        console.error('Fetch booking failed:', err);
        toast.error("Không thể lấy thông tin giữ ghế");
        navigate(`/chon-ghe/${state.maSuatChieu}`);
      }
    };

    fetchBooking();
  }, [state?.maDatVe]);

  useEffect(() => {
    if (!state?.maDatVe) return;

    const fetchCombos = async () => {
      const res = await api.get(`/combodoan/${state.maDatVe}/combos`);
      setSelectedCombos(res.data);
    };

    fetchCombos();
  }, [state?.maDatVe]);


  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      toast.error("Đã hết thời gian giữ ghế!");
      navigate(`/chon-ghe/${state.maSuatChieu}`, {
        state: { maDatVe: state.maDatVe }
      });
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);









  const handleApplyPromo = async () => {
    if (!promo) return toast.error('Vui lòng nhập mã khuyến mãi')

    try {
      const { data } = await api.post('/khuyenmai/kiem-tra', {
        maKhuyenMai: promo,
        tongTien: total
      })

      setDiscount(data.soTienGiam)
      setFinalTotal(data.tongTienSauGiam)
      setKhuyenMaiId(data.khuyenMaiId)

      toast.success('Áp dụng mã khuyến mãi thành công!')
    } catch (err) {
      setDiscount(0)
      setFinalTotal(total)
      setKhuyenMaiId(null)
      toast.error(err.response?.data?.message || 'Mã không hợp lệ')
    }
  }


  const handleConfirm = async () => {
    try {
      setLoading(true)
      const phuongThuc = selectedMethod.toLowerCase()

      // Nếu đã có maDatVe (được tạo khi giữ chỗ) -> gọi checkout endpoint để tạo redirectUrl cho booking hiện tại
      if (state?.maDatVe) {
        const res = await api.post(`/datve/${state.maDatVe}/checkout`, { phuongThuc, tongTien: finalTotal, khuyenMaiId })
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
        tongTien: finalTotal,
        phuongThuc,
        khuyenMaiId
      }
      const res = await api.post('/datve', payload)
      if (res.data.redirectUrl) {
        window.location.href = res.data.redirectUrl // 👉 chuyển sang trang thanh toán
      } else {
        navigate('/dat-ve-thanh-cong', {
          state: {
            booking: res.data.data
          }
        })
      }
    } catch (err) {
      console.error(err)
      const msg = err?.response?.data?.message || 'Đặt vé thất bại'
      toast.error(msg)
    } finally {
      setLoading(false)
    }

  }

  const handleClickThanhToan = () => {
    const phanLoai = phim?.phanLoai || state?.phim?.phanLoai || 'P'
    const rule = AGE_RULES[phanLoai]

    // Phim P → không cần xác nhận
    if (!rule || rule.age === 0) {
      handleConfirm()
      return
    }

    // Phim có giới hạn tuổi
    setAgeMessage(rule.message)
    setShowAgeModal(true)
  }

  console.log('Phân loại phim:', phim?.phanLoai)
  if (!state) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">Trang thanh toán</h2>
        <p>Không có dữ liệu thanh toán. Vui lòng chọn ghế trước khi tới trang này.</p>
      </div>
    )
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
            className="bg-primary-dull text-white px-4 w-28 py-2 rounded-lg hover:bg-primary transition cursor-pointer"
          >
            Áp dụng
          </button>
        </div>


        <h2 className="text-2xl font-semibold my-6">Phương thức thanh toán</h2>
        <div className="space-y-4">
          {[
            {
              id: 'vnpay',
              name: 'VNPay',
              desc: 'Thanh toán bằng QR ngân hàng nội địa.',
              logo: { src: vnpay, alt: 'VNPay' }
            },
            {
              id: 'momo',
              name: 'MoMo',
              desc: 'Thanh toán qua ví điện tử MoMo nhanh chóng.',
              logo: { src: momo, alt: 'MoMo' }
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
        <ThongTinDatVe
          phim={state.phim}
          phong={state.phong}
          rap={state.phong?.rap}
          poster={state.poster}
          seats={state.seats || []}
          selectedSeats={state.selectedSeats}
          selectedTime={state.gioBatDau}
          date={state.gioBatDau}
          giaVeCoBan={state.pricePerSeat}
          selectedCombos={state.selectedCombos}
          comboTotal={comboTotal}
          discount={discount}
          finalTotal={finalTotal}
          timeLeft={timeLeft}
          onBack={() =>
            navigate('/chon-combo', {
              state: {
                ...state
              }
            })
          }
          onAction={handleClickThanhToan}
          actionLabel="Thanh toán"
          loading={loading}
        />
      </div>
      {showAgeModal && <XacNhanTuoiModal doTuoi={phim.phanLoai} ageMessage={ageMessage} setShowAgeModal={setShowAgeModal} handleConfirm={handleConfirm} />}

    </div>

  )
}

export default ThanhToan
