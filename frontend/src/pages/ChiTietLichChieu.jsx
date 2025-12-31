import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useApi from '../hooks/useApi'
import DateSelect from '../components/DateSelect'
import { MapPin, PhoneCall } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { clearAuthIntent, setAuthIntent } from '../redux/features/authSlice'
import Dangnhap from '../components/Dangnhap'

const ChiTietLichChieu = () => {
  const api = useApi()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { maRap } = useParams()
  const user = useSelector(state => state.auth.user)
  const authIntent = useSelector(state => state.auth.authIntent)
  const [dateSelected, setDateSelected] = useState(null)
  const [rap, setRap] = useState(null)
  const [phims, setPhims] = useState([])
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)


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

  useEffect(() => {
    if (!user || !authIntent) return;
    if (authIntent.action === 'chon-suatChieu' && authIntent.maSuatChieu) {
      navigate(`/chon-ghe/${authIntent.maSuatChieu}`)
      window.scrollTo(0, 0)
      dispatch(clearAuthIntent())
    }

  }, [user, authIntent, navigate, dispatch])

  console.log(phims);

  const handleSelectRap = (newMaRap) => {
    if (!newMaRap || newMaRap === 'all') return
    navigate(`/lich-chieu/${newMaRap}`)
  }

  const isPastShowtime = (gioBatDau, dateSelected) => {
    const now = new Date()

    const showTime = new Date(gioBatDau)

    // nếu không phải hôm nay → luôn hợp lệ
    const todayStr = now.toISOString().slice(0, 10)
    if (dateSelected !== todayStr) return false

    return showTime <= now
  }

  const groupByPhong = (suatChieus) => {
    const map = {}
    suatChieus.forEach(sc => {
      if (!map[sc.maPhong]) {
        map[sc.maPhong] = {
          tenPhong: sc.tenPhong,
          suatChieus: []
        }
      }
      map[sc.maPhong].suatChieus.push(sc)
    })
    return Object.values(map)
  }

  const onPickShow = (maSuatChieu, disabled) => {
    if (disabled) return;
    if (!maSuatChieu) {
      toast.error('maSuatChieu không hợp lệ')
      return
    }
    if (!user) {
      dispatch(clearAuthIntent())
      dispatch(setAuthIntent({ action: 'chon-suatChieu', maSuatChieu }))
      setShowLogin(true)
      return
    }
    navigate(`/chon-ghe/${maSuatChieu}`)
    window.scrollTo(0, 0)
  }
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
        selectRap={maRap}
        onSelectRap={handleSelectRap}
        all={false}
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
          <div className="flex gap-4 items-center max-md:items-start flex-col md:flex-row">
            <img
              src={phim.poster}
              alt={phim.tenPhim}
              className="w-28 h-40 object-contain rounded"
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
                {groupByPhong(phim.suatChieus).map(phong => (
                  <div key={phong.tenPhong} className="mt-4 border-l-4 border-primary/50 pl-4">
                    <p className="text-sm font-medium text-gray-300 mb-2">
                      {phong.tenPhong}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {phong.suatChieus.map(sc => {
                        const isPast = isPastShowtime(sc.gioBatDau, dateSelected)

                        return (
                          <button
                            key={sc.maSuatChieu}
                            disabled={isPast}
                            className={` px-4 py-2 border rounded transition
                            ${isPast
                                ? 'bg-gray-700/50 text-gray-400 border-gray-600 cursor-not-allowed'
                                : 'bg-white/5 hover:bg-primary/90 border-primary/30 cursor-pointer'
                              }
                          `}
                            onClick={() => {
                              onPickShow(sc.maSuatChieu, isPast)
                            }}
                          >
                            {new Date(sc.gioBatDau).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </button>
                        )
                      })}
                    </div>
                  </div>
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

      {showLogin && (<Dangnhap onClose={() => setShowLogin(false)} />)}
    </div>
  )
}

export default ChiTietLichChieu
