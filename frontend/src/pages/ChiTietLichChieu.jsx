import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useApi from '../hooks/useApi'
import DateSelect from '../components/DateSelect'
import { MapPin, PhoneCall } from 'lucide-react'

const ChiTietLichChieu = () => {
  const api = useApi()
  const navigate = useNavigate()
  const { maRap } = useParams()

  const [dateSelected, setDateSelected] = useState(null)
  const [rap, setRap] = useState(null)
  const [phims, setPhims] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRap = async () => {
      try {
        const res = await api.get(`/rap/${maRap}`)
        setRap(res.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchRap()
  }, [maRap])
  useEffect(() => {
    if (!dateSelected) {
      const today = new Date()
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const dd = String(today.getDate()).padStart(2, '0')
      setDateSelected(`${yyyy}-${mm}-${dd}`)
    }
  }, [])
  useEffect(() => {
    if (!maRap || !dateSelected) return

    const fetchLichChieu = async () => {
      setLoading(true)
      try {
        const res = await api.get('/suatchieu/lich-chieu-rap', {
          params: { maRap, date: dateSelected }
        })
        setPhims(res.data)
      } catch (err) {
        console.error(err)
        setPhims([])
      } finally {
        setLoading(false)
      }
    }

    fetchLichChieu()
  }, [maRap, dateSelected])

  return (
    <div className="px-6 md:px-16 lg:px-40 py-34">
      {rap && (
        <div className="mb-2 p-6 rounded-xl bg-primary/10 border border-primary text-center">
          <h1 className="text-3xl font-bold text-primary">
            {rap.tenRap}
          </h1>
          <p className="text-gray-400 mt-2 flex items-center justify-center gap-3">
            <MapPin className='text-blue-500' /> {rap.diaChi}
          </p>
          {rap.soDienThoai && (
            <p className="text-gray-400 flex items-center justify-center mt-1 gap-3">
              <PhoneCall className='text-red-500' /> {rap.soDienThoai}
            </p>
          )}
        </div>
      )}

      {/* ===== CHỌN NGÀY ===== */}
      <DateSelect
        selected={dateSelected}
        onSelect={setDateSelected}
      />

      {/* ===== LOADING ===== */}
      {loading && (
        <div className="py-10 text-center text-lg">
          Đang tải lịch chiếu...
        </div>
      )}

      {/* ===== PHIM + SUẤT CHIẾU ===== */}
      {!loading && phims.map(phim => (
        <div
          key={phim.maPhim}
          className="mt-10 border-b pb-6"
        >
          <div className="flex gap-4 items-center">
            <img
              src={phim.poster}
              alt={phim.tenPhim}
              className="w-28 h-40 object-cover rounded"
            />
            <div className='space-y-2'>
              <h2 className="text-xl font-semibold">
                {phim.tenPhim}
              </h2>
              <p className="text-sm text-gray-500">
                {phim.thoiLuong} phút
              </p>
              <p className='text-sm text-gray-400'>Nội dung: {phim.noiDung.slice(0, 150)}...</p>
              <div className="flex flex-wrap gap-3 mt-4">
                {phim.suatChieus.map(sc => (
                  <button
                    key={sc.maSuatChieu}
                    className="px-4 py-2 border border-primary rounded
                           hover:bg-primary hover:text-white transition cursor-pointer"
                    onClick={() =>
                      navigate(`/chon-ghe/${sc.maSuatChieu}`)
                    }
                  >
                    {new Date(sc.gioBatDau).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      ))}

      {/* ===== KHÔNG CÓ SUẤT ===== */}
      {!loading && dateSelected && phims.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          Không có suất chiếu cho ngày này
        </p>
      )}
    </div>
  )
}

export default ChiTietLichChieu
