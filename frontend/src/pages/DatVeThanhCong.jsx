import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import useApi from '../hooks/useApi'
import { Armchair, Calculator, CheckCircle, Clock, DoorOpenIcon } from 'lucide-react'
import { formatDate } from '../lib/dateFormat'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'

const DatVeThanhCong = () => {
  const [params] = useSearchParams()
  const maDatVe = params.get('maDatVe')
  const navigate = useNavigate()
  const api = useApi(true)

  const [booking, setBooking] = useState(null)

  useEffect(() => {
    if (!maDatVe) {
      navigate('/')
      return
    }

    api.get(`/datve/${maDatVe}`)
      .then(res => setBooking(res.data))
      .catch(() => navigate('/lich-su-dat-ve'))
  }, [maDatVe])

  if (!booking) return null

  console.log(booking);
  const phim = booking?.suatChieu?.phim || {}
  const suatChieu = booking?.suatChieu || {}
  const phongChieu = suatChieu?.phongChieu || {}
  const rap = phongChieu?.rap || {}
  const gheList = booking?.chiTietDatVes?.map(item => {
    const ghe = item.ghe
    return `${ghe.hang}${ghe.soGhe}`;
  }).join(", ")




  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">

      <BlurCircle top="100px" left="200px" />
      <BlurCircle bottom="100px" right="200px" />
      <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Đặt vé thành công!</h1>
      <p className="text-sm text-gray-300 mb-6 text-center">
        Vé điện tử đã được gửi đến email của bạn.
      </p>

      {/* Vé */}
      <div className="bg-primary-dull/10 border border-primary backdrop-blur rounded-xl p-6 max-w-3xl w-full flex gap-6">

        {/* Poster */}
        <img
          src={phim.poster}
          alt={phim.tenPhim}
          className="w-40 rounded-lg"
        />

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold">{phim.tenPhim}</h2>
          <p className="text-sm text-gray-300">{phim.theLoai}</p>

          <div className="mt-3 text-sm space-y-6">
            <div className='flex justify-between w-full mt-8'>
              <div className=''>
                <label className='font-semibold'> NGÀY CHIẾU </label>
                <p className='text-primary flex items-center gap-1'>
                  <Calculator className='size-4' /> {formatDate(suatChieu.gioBatDau)}
                </p>
              </div>
              <div>

                <label className='font-semibold'> GIỜ CHIẾU </label>
                <p className='text-primary flex items-center gap-1'>
                  <Clock className='size-4' /> {isoTimeFormat(suatChieu.gioBatDau)}
                </p>
              </div>
            </div>
            <div>

              <label className='font-semibold'>RẠP PHIM</label>
              <p className='text-primary flex items-center gap-1'>
                <DoorOpenIcon className='size-4' />
                <span>{rap.tenRap} - {phongChieu.tenPhong} </span>
              </p>
            </div>
            <div className='flex justify-between'>

              <div >
                <label className='font-semibold'>GHẾ ĐÃ ĐẶT</label>
                <p className='text-primary flex items-center gap-1'>
                  <Armchair className='size-4' /> {gheList}
                </p>
              </div>
              <div >
                <label className='font-semibold'>TỔNG TIỀN</label>
                <p className="text-primary font-bold text-lg">
                  {booking.tongTien.toLocaleString()}đ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QR */}
        <div className="flex flex-col items-center flex-1">
          <p className="text-xs mb-2">Mã đặt vé</p>
          <p className="font-bold mb-2">#{booking.maDatVe}</p>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.maDatVe}`} alt="QR Code" />
        </div>

      </div>

      {/* Actions */}
      <div className=" mt-6">
        
        <button
          onClick={() => navigate('/')}
          className="border px-4 py-2 rounded cursor-pointer hover:text-white flex items-center gap-2"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  )
}

export default DatVeThanhCong
