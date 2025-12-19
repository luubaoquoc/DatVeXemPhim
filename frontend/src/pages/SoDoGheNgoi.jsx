import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import { ClockIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'
import useApi from '../hooks/useApi'
import ThongoTinDatVe from '../components/ThongTinDatVe'
import GheLayout from '../components/GheLayout'

const SoDoGheNgoi = () => {
  const { maPhim: _maPhim, maSuatChieu } = useParams()
  const [selectedSeats, setSelectedSeats] = useState([])
  const [bookedSeats, setBookedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)
  const [seats, setSeats] = useState([]) // lấy từ BE
  const navigate = useNavigate()
  const api = useApi(true)
  const publicApi = useApi(false)


  // Lấy thông tin suất chiếu
  useEffect(() => {
    const loadShow = async () => {
      if (!maSuatChieu) return
      try {
        const res = await publicApi.get(`/suatchieu/${maSuatChieu}`)
        const sc = res.data
        setShow(sc)
        if (sc.gioBatDau) setSelectedTime(sc.gioBatDau)
      } catch (err) {
        console.error('Không thể tải thông tin suất chiếu', err)
        setShow({ phim: { tenPhim: 'Phim' }, gioBatDau: null, phongChieu: null })
      }
    }
    loadShow()
  }, [maSuatChieu, publicApi])

  // Lấy danh sách ghế của phòng (tùy thuộc show.phongChieu.maPhong)
  useEffect(() => {
    const fetchSeats = async () => {
      const maPhong = show?.phongChieu?.maPhong
      if (!maPhong) return;
      try {

        const res = await api.get(`/ghe`, { params: { maPhong } })
        // expected res.data = array of seats: { maGhe, maPhong, hang, soGhe, trangThai, ...}
        const data = res.data.items || res.data || []
        // normalize seat items to have id = hang + soGhe
        const normalized = data.map(s => ({
          ...s,
          id: s.id || `${s.hang}${s.soGhe}`,
          hang: s.hang,
          soGhe: s.soGhe,
          trangThai: typeof s.trangThai === 'boolean' ? s.trangThai : !!s.trangThai
        }))
        setSeats(normalized)
      } catch (err) {
        console.error('Không thể load ghế:', err)
      }
    }

    fetchSeats()
  }, [show, publicApi])

  console.log('Selected Seats:', selectedSeats);

  // Lấy danh sách ghế đã đặt cho suất chiếu này
  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (!maSuatChieu) return
      try {
        const res = await api.get(`/datve/ghe-da-dat/${maSuatChieu}`)
        console.log(res.data.gheDaDat);

        // backend nên trả array dạng ['A1','B2', ...]
        const booked = (res.data.gheDaDat || res.data || []).map(s => String(s).trim().toUpperCase())
        setBookedSeats(booked)
      } catch (err) {
        console.error('Lỗi khi tải ghế đã đặt:', err)
        setBookedSeats([])
      }
    }
    fetchBookedSeats()
  }, [maSuatChieu, api])

  const handleSeatClick = (seatId) => {

    if (bookedSeats.includes(seatId)) return //  Không cho chọn ghế đã đặt
    if (!selectedTime) return toast.error('Vui lòng chọn khung giờ chiếu!')
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      return toast.error('Bạn chỉ có thể chọn tối đa 5 ghế!')
    }
    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(seat => seat !== seatId)
        : [...prev, seatId]
    )
  }


  const handleThanhToan = async () => {
    if (selectedSeats.length === 0)
      return toast.error("Vui lòng chọn ghế!");
    try {
      const payload = {
        maSuatChieu,
        tongTien: selectedSeats.length * (show.giaVeCoBan || 0),
        chiTiet: selectedSeats.map(seatId => {
          const s = seats.find(s => `${s.hang}${s.soGhe}` === seatId);
          return {
            maGhe: s.maGhe,
            giaVe: show.giaVeCoBan
          };
        }),
      };

      const res = await api.post("/datve", payload);
      if (res.data?.maDatVe) {
        navigate("/thanh-toan", {
          state: {
            maDatVe: res.data.maDatVe,
            thoiHanThanhToan: res.data.thoiHanThanhToan,
            maSuatChieu,
            maPhim: _maPhim,
            selectedSeats,
            pricePerSeat: show.giaVeCoBan,
            phim: show.phim,
            poster: show.phim?.poster,
            phong: show.phongChieu,
            gioBatDau: show.gioBatDau,
          },
        });
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Đặt vé thất bại";
      toast.error(msg);
    }
  }



  // Giao diện chính
  if (!show) return <Loading />

  return (
    <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-40 '>
      <div className='flex flex-col flex-2'>
        <div className='flex items-center bg-primary/10 border border-primary/20 rounded-lg py-2'>
          <p className='text-lg font-semibold px-6'>Suất chiếu</p>
          <div className='flex items-center gap-4 px-6'>
            <ClockIcon className='w-4 h-4' />
            <p className='text-sm'>{show.gioBatDau ? isoTimeFormat(show.gioBatDau) : 'Chưa có giờ'}</p>
            <span className='text-sm text-gray-300'>-</span>
            <p className='text-sm text-gray-300'>Phòng: <span className='text-primary'>{show.phongChieu?.tenPhong || 'N/A'}</span></p>
          </div>
        </div>

        {/* Layout ghế */}
        <div className='relative flex-1 flex flex-col items-center max-md:mt-16 mt-10'>
          <BlurCircle top='-100px' left='-100px' />
          <BlurCircle bottom='0' right='0' />
          <img src={assets.screenImage} alt="" className='shadow-2xl rounded-lg shadow-red-200 mt-6' />
          <p className='text-gray-300 text-sm mb-6'>Màn hình</p>

          <GheLayout
            seats={seats}
            bookedSeats={bookedSeats}
            selectedSeats={selectedSeats}
            onSelectSeat={(seat) => handleSeatClick(`${seat.hang}${seat.soGhe}`)}
            mode="booking"
          />

        </div>
      </div>

      {/* Sidebar thông tin */}
      <div className="flex flex-1 justify-center md:justify-end mt-10 md:mt-0">
        <ThongoTinDatVe
          phim={show.phim}
          phong={show.phongChieu}
          rap={show.phongChieu?.rap}
          poster={show.phim?.poster}
          date={show.gioBatDau}
          seats={seats}
          selectedSeats={selectedSeats}
          selectedTime={selectedTime}
          giaVeCoBan={show.giaVeCoBan}
          onBack={() => { navigate(-1); scrollTo(0, 0) }}
          onAction={handleThanhToan}
          actionLabel="Tiếp tục"
        />
      </div>

    </div>
  )
}

export default SoDoGheNgoi
