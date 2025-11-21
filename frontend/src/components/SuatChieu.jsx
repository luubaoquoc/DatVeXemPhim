import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Dangnhap from './Dangnhap'
import useApi from '../hooks/useApi'

const SuatChieu = ({ maPhim, date }) => {
  const { user } = useSelector((state) => state.auth || {})
  const navigate = useNavigate()
  const [raps, setRaps] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [pendingShowtime, setPendingShowtime] = useState(null)
  const api = useApi()

  useEffect(() => {
    if (!maPhim || !date) {
      setRaps([])
      setError(null)
      return
    }

    let cancelled = false
    const fetchRaps = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get('/suatchieu/raps', {
          params: { maPhim, date },
        })
        if (!cancelled) {
          const now = new Date()

          const processedRaps = (res.data || [])
            .map((rap) => ({
              ...rap,
              phongChieus: (rap.phongChieus || [])
                .map((phong) => ({
                  ...phong,
                  suatChieus: (phong.suatChieus || []).map((sc) => {
                    if (!sc.gioBatDau) return sc
                    const showTime = new Date(sc.gioBatDau)
                    const sameDay =
                      showTime.toLocaleDateString('vi-VN') ===
                      now.toLocaleDateString('vi-VN')
                    return {
                      ...sc,
                      isDisabled: sameDay && showTime < now, // ✅ disable nếu đã qua giờ hiện tại
                    }
                  }),
                }))
                .filter((phong) => phong.suatChieus.length > 0),
            }))
            .filter((rap) => rap.phongChieus.length > 0)

          setRaps(processedRaps)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err)
          toast.error('Không thể tải rạp / suất chiếu')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchRaps()
    return () => {
      cancelled = true
    }
  }, [maPhim, date])

  useEffect(() => {
    if (user && pendingShowtime) {
      navigate(`/chon-ghe/${pendingShowtime}`)
      window.scrollTo(0, 0)
      setPendingShowtime(null)
      setShowLogin(false)
    }
  }, [user, pendingShowtime, maPhim, date, navigate])

  const onPickShow = (maSuatChieu, disabled) => {
    if (disabled) return // ✅ chặn bấm suất đã qua
    if (!maSuatChieu) {
      toast.error('maSuatChieu không hợp lệ')
      return
    }

    if (!user) {
      setPendingShowtime(maSuatChieu)
      setShowLogin(true)
      return
    }

    navigate(`/chon-ghe/${maSuatChieu}`)
    window.scrollTo(0, 0)
  }

  return (
    <div className='mt-8 flex flex-col'>
      <h3 className='text-lg font-semibold mb-4'>Rạp và giờ chiếu</h3>

      {loading && (
        <div className='text-sm text-gray-300'>Đang tải lịch chiếu...</div>
      )}

      {!loading && error && (
        <div className='text-sm text-red-400'>
          Không thể tải lịch chiếu. Vui lòng thử lại sau.
        </div>
      )}

      {!loading && !error && raps.length === 0 && (
        <div className='text-sm text-gray-400'>
          Không có lịch chiếu cho ngày này.
        </div>
      )}

      {!loading && !error && raps.length > 0 && (
        <div className='space-y-6'>
          {raps.map((rap) => (
            <div
              key={rap.maRap || rap.id || rap.tenRap}
              className='bg-primary/5 p-4 rounded'
            >
              <div className='flex items-center justify-between mb-3'>
                <div>
                  <div className='font-semibold'>
                    {rap.tenRap || rap.name || 'Rạp'}
                  </div>
                  {rap.diaChi && (
                    <div className='text-sm text-gray-400'>{rap.diaChi}</div>
                  )}
                </div>
              </div>

              <div className='space-y-3 flex flex-col md:flex-wrap gap-2'>
                {(rap.phongChieus || []).map((phong) => (
                  <div
                    key={phong.maPhong || phong.id || phong.tenPhong}
                    className='mb-2'
                  >
                    <div className='text-sm font-medium mb-2'>
                      {phong.tenPhong || phong.name || 'Phòng'}
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {(phong.suatChieus || []).map((sc) => (
                        <button
                          key={sc.maSuatChieu || sc.id}
                          onClick={() =>
                            onPickShow(sc.maSuatChieu, sc.isDisabled)
                          }
                          disabled={sc.isDisabled}
                          className={`px-3 py-1 rounded text-sm border cursor-pointer
                            ${sc.isDisabled
                              ? 'bg-gray-700/50 text-gray-400 border-gray-600 cursor-not-allowed'
                              : 'bg-white/5 hover:bg-primary/90 border-primary/30'
                            }`}
                        >
                          {sc.gioBatDau
                            ? new Date(sc.gioBatDau).toLocaleTimeString(
                              'vi-VN',
                              { hour: '2-digit', minute: '2-digit' }
                            )
                            : '—'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showLogin && <Dangnhap onClose={() => setShowLogin(false)} />}
    </div>
  )
}

export default SuatChieu
