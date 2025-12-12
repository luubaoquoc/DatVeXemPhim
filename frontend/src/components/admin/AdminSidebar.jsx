import React, { useState } from 'react'
import {
  LayoutDashboardIcon,
  FilmIcon,
  ClockIcon,
  TicketIcon,
  Building2Icon,
  ListIcon,
  DoorOpenIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  AwardIcon,
  StarIcon,
  TagsIcon,
  FileTextIcon,
  BookUserIcon,
  ScanLineIcon,
  ReceiptTextIcon,
  ImagePlus,
  Armchair,
  LogOutIcon
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { logout } from '../../redux/features/authSlice'

const AdminSidebar = () => {
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()

  const [openMenus, setOpenMenus] = useState({})

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  const adminNavlinks = [
    { name: 'Tổng quan', path: '/admin', icon: LayoutDashboardIcon },
    {
      name: 'Vận hành Rạp',
      icon: TicketIcon,
      children: [
        // Đây là module chính để check-in và quét mã QR
        { name: 'Check-in & Quét vé', path: '/admin/van-hanh/check-in', icon: ScanLineIcon },   // Dành cho: NVR (Bắt buộc)

        // Module tạo và in vé mới tại quầy POS
        { name: 'Bán vé tại quầy (POS)', path: '/admin/van-hanh/ban-ve-tai-quay', icon: ReceiptTextIcon }, // Dành cho: NVR (Bắt buộc)

        // Xem lịch sử bán hàng cá nhân (dựa trên maNhanVienBan)
        { name: 'Lịch sử giao dịch NV', path: '/admin/van-hanh/lich-su-ban-ve', icon: ListIcon } // Dành cho: NVR (Xem)
      ]
    },
    {
      name: 'Quản lý phim',
      icon: FilmIcon,
      children: [
        { name: 'Danh sách phim', path: '/admin/quan-ly-phim', icon: FilmIcon },
        { name: 'Danh sách đạo diễn', path: '/admin/quan-ly-dao-dien', icon: BookUserIcon },
        { name: 'Danh sách diễn viên', path: '/admin/quan-ly-dien-vien', icon: AwardIcon },
        { name: 'Danh sách thể loại', path: '/admin/quan-ly-the-loai', icon: TagsIcon },
        { name: 'Danh sách đánh giá', path: '/admin/quan-ly-danh-gia', icon: StarIcon },
        { name: 'Danh sách banner', path: '/admin/banner', icon: ImagePlus }
      ]
    },
    { name: 'Quản lý suất chiếu', path: '/admin/quan-ly-suat-chieu', icon: ClockIcon },

    { name: 'Quản lý đơn đặt vé', path: '/admin/quan-ly-don-dat-ve', icon: TicketIcon },
    {
      name: 'Quản lý rạp',
      icon: Building2Icon,
      children: [
        { name: 'Danh sách rạp', path: '/admin/quan-ly-rap', icon: ListIcon },
        { name: 'Danh sách phòng chiếu', path: '/admin/quan-ly-phong-chieu', icon: DoorOpenIcon },
        { name: 'Danh sách ghế', path: '/admin/quan-ly-ghe', icon: Armchair }
      ]
    },
    {
      name: 'Báo cáo',
      path: '/admin/bao-cao',
      icon: FileTextIcon
    },
    {
      name: 'Quản lý tài khoản',
      path: '/admin/quan-ly-tai-khoan',
      icon: UserIcon,
    }
  ]

  return (
    <div className='h-[calc(100vh-64px)] md:flex flex-col items-center pt-8 max-w-13 md:max-w-60
    border-r border-gray-300/30 w-full text-sm overflow-y-auto bg-gray-950 no-scrollbar sticky top-[64px]'>
      {/* Avatar + tên admin */}
      <div className='flex flex-col items-center border-b border-gray-700 pb-3'>
        <img src={user.anhDaiDien} alt="" className='h-9 md:h-18 w-9 md:w-18 rounded-full mx-auto' />
        <p className='mt-2 text-xl max-md:hidden font-medium text-gray-200'>{user.hoTen}</p>
        <div onClick={() => dispatch(logout())}
          className='flex items-center mt-2 gap-2 border p-2 border-red-400 rounded cursor-pointer hover:text-red-400 transition'>
          <LogOutIcon className='size-4 text-red-400' />
          <button className=' text-red-400 cursor-pointer'>Đăng xuất</button>
        </div>
      </div>

      {/* Danh sách menu */}
      <div className='w-full mt-2 space-y-2'>
        {adminNavlinks.map((link, index) => (
          <div key={index} className='mb-1'>
            {/* Mục không có children */}
            {!link.children ? (
              <NavLink
                to={link.path}
                end
                className={({ isActive }) =>
                  `relative flex items-center justify-start max-md:justify-center gap-3 w-full py-2.5 px-6 text-gray-300 font-semibold transition-all
                   ${isActive
                    ? 'bg-primary/20 text-primary border-r-2'
                    : 'text-gray-300 hover:bg-primary/20 hover:text-white'}`
                }
              >
                <link.icon className='size-5 shrink-0' />
                <p className='max-md:hidden truncate'>{link.name}</p>
              </NavLink>
            ) : (
              // Mục có children
              <div>
                <button
                  onClick={() => toggleMenu(link.name)}
                  className='flex items-center justify-between w-full px-4 md:px-6 py-2.5 text-gray-300 font-semibold hover:bg-primary/20 transition-all cursor-pointer'
                >
                  <div className='flex items-center gap-3'>
                    <link.icon className='size-5 shrink-0' />
                    <p className='max-md:hidden truncate'>{link.name}</p>
                  </div>
                  {openMenus[link.name] ? (
                    <ChevronDownIcon className='size-4 text-gray-400 max-md:hidden' />
                  ) : (
                    <ChevronRightIcon className='size-4 text-gray-400 max-md:hidden' />
                  )}
                </button>

                {/* Danh sách con */}
                {openMenus[link.name] && (
                  <div className='mt-1 md:ml-4 border-l border-gray-700/40'>
                    {link.children.map((child, i) => (
                      <NavLink
                        key={i}
                        to={child.path}
                        className={({ isActive }) =>
                          `relative flex items-center gap-3 w-full py-2.5 pl-6 transition-all
                           ${isActive
                            ? 'bg-primary/20 text-primary border-r-2'
                            : 'text-gray-400 hover:text-white hover:bg-primary/10'}`
                        }
                      >
                        <child.icon className='size-4 shrink-0' />
                        <p className='max-md:hidden truncate'>{child.name}</p>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminSidebar
