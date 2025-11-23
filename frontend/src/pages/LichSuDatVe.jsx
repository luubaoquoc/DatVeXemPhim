import React, { useEffect, useState } from 'react'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import { dateFormat } from '../lib/dateFormat'
import useApi from '../hooks/useApi'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../redux/features/authSlice'
import ProfileSidebar from '../components/ProfileSidebar'


const LichSuDatVe = () => {

  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const currency = import.meta.env.VITE_CURRENCY || '₫'
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const api = useApi(true)

  const getMyBookings = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/datve/user')
      setBookings(res.data || [])
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || 'Lỗi tải lịch sử đặt vé')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getMyBookings()
  }, [])

  return !isLoading ? (
    <div className='relative my-40 mb-20 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-screen'>
      <div className="flex flex-col md:flex-row max-md:px-10">
        <div className="flex-1">
          <ProfileSidebar user={user} dispatch={dispatch} logout={logout} />
        </div>
        <BlurCircle top='100px' left='100px' />
        <BlurCircle bottom='0px' left='600px' />

        <div className="flex-2 bg-black/30 p-8 shadow-lg border-l border-primary/20 w-full">

          <h1 className='text-lg font-semibold mb-4'>Lịch sử đặt vé</h1>

          {bookings.length === 0 ? (
            <p className='text-gray-400 mt-10'>Bạn chưa có đơn đặt vé nào.</p>
          ) : (
            bookings.map((item, index) => {
              const suat = item.suatChieu || {}
              const phim = suat.phim || {}
              const phong = suat.phongChieu || {}
              const thanhToan = item.thanhToan || {}
              const isSuccess = item.trangThai === 'Thành công' || thanhToan.trangThai === 'Thành công'

              return (
                <div key={index} className='flex flex-col md:flex-row justify-between bg-primary/8 
              border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl'>
                  <div className='flex flex-col md:flex-row'>
                    <img
                      src={phim.poster || '/assets/images/default-movie.jpg'}
                      alt={phim.tenPhim}
                      className='md:max-w-45 aspect-video h-auto object-cover rounded'
                    />
                    <div className='flex flex-col p-4'>
                      <p className='text-lg font-semibold'>{phim.tenPhim}</p>
                      <p className='text-gray-400 text-sm mt-1'>
                        <span className='text-primary'>Phòng: </span>{phong.tenPhong || 'N/A'}
                      </p>
                      <p className='text-gray-400 text-sm mt-1'>
                        <span className='text-primary'>Suất chiếu: </span>{suat.gioBatDau}
                      </p>
                      <p className='text-gray-400 text-sm mt-auto'>
                        <span className='text-primary'>Ngày đặt: </span>{dateFormat(item.ngayDat)}
                      </p>
                    </div>
                  </div>

                  <div className='flex flex-col md:items-end md:text-right justify-between p-4'>
                    <div className='flex items-center gap-4'>
                      <p className='text-2xl font-semibold mb-3'>
                        {Number(item.tongTien).toLocaleString('vi-VN')} {currency}
                      </p>
                      {/* {!isSuccess && (
                    <button
                      className='bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer'
                      onClick={() => toast('Chức năng thanh toán lại đang phát triển')}
                    >
                      Thanh toán lại
                    </button>
                  )} */}
                    </div>
                    <div className='text-sm'>
                      <p><span className='text-primary'>Ghế: </span>{item.soGhe || 'N/A'}</p>
                      <p>
                        <span className='text-primary'>Trạng thái: </span>
                        <b className={isSuccess ? 'text-green-500' : 'text-red-400'}>
                          {thanhToan.trangThai || item.trangThai}
                        </b>
                      </p>
                      <p>
                        <span className='text-primary'>Phương thức: </span>{thanhToan.phuongThuc?.toUpperCase() || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  ) : (
    <Loading height="100vh" />
  )
}

export default LichSuDatVe
