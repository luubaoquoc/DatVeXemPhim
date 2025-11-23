import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, HeartIcon, HistoryIcon, LogOutIcon, MenuIcon, SearchIcon, UserIcon, XIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../redux/features/authSlice'
import Dangnhap from './Dangnhap'

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [openDienAnhDropdown, setOpenDienAnhDropdown] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(false)
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)



  return (
    <div className='fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6
    md:px-16 lg:px-36 py-5'>
      <Link to='/' className='max-md:flex-1'>
        <h1 className='text-4xl font-bold bg-gradient-to-r from-[#20B2AA] to-yellow-300/50 bg-clip-text text-transparent'>
          Go Cinema
        </h1>
      </Link>

      <div className={`
      max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium 
      max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center
      gap-7 min-md:px-8 py-3 max-md:h-screen min-md:rounded-full backdrop-blur bg-black/70
      md:bg-white/10 md:border-b border-primary overflow-ellipsis transition-[width] duration-300
      ${isOpen ? "max-md:w-full" : "max-md:hidden"}`}>

        <XIcon className='md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer'
          onClick={() => setIsOpen(!isOpen)} />

        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/' className='hover:text-primary'> Trang Chủ</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/phims' className='hover:text-primary'> Phim</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/lich-chieu' className='hover:text-primary'> Lịch Chiếu</Link>
        <div
          className="relative group"
          onClick={() => setOpenDienAnhDropdown(prev => !prev)}
          onMouseLeave={() => setOpenDienAnhDropdown(false)}
        >
          <div className="flex items-center gap-1 cursor-pointer hover:text-primary">
            <span>Góc Điện Ảnh</span>
            <ChevronDown className=" w-4 h-4 text-gray-400" />
          </div>

          <div
            className={`absolute right-[-70px] mt-2 w-48 bg-black/90 shadow-lg rounded-lg border-b py-2 z-50
            transition-all duration-200
            ${openDienAnhDropdown || "group-hover:opacity-100 group-hover:visible"}
            ${openDienAnhDropdown ? "opacity-100 visible" : "opacity-0 invisible"}
          `}
          >
            <Link to="/dao-dien" className="flex px-4 py-2 text-sm text-gray-300 hover:bg-primary/20 hover:border-l border-primary">
              Đạo Diễn
            </Link>

            <Link to="/dien-vien" className="flex px-4 py-2 text-sm text-gray-300 hover:bg-primary/20 hover:border-l border-primary">
              Diễn Viên
            </Link>

            <Link to="/the-loai" className="flex px-4 py-2 text-sm text-gray-300 hover:bg-primary/20 hover:border-l border-primary">
              Thể Loại
            </Link>
          </div>
        </div>

        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/rap' className='hover:text-primary'> Rạp</Link>
      </div>

      <div className='flex items-center gap-8'>
        <SearchIcon className='max-md:hidden w-6 h-6 cursor-pointer' />
        {!user ? (
          <button onClick={() => setShowLogin(true)}
            className='px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition
         rounded-full font-medium cursor-pointer'>
            Login
          </button>) : (
          <div
            className="relative group"
            onClick={() => setOpenDropdown((prev) => !prev)}
            onMouseLeave={() => setOpenDropdown(false)}
          >
            {/* Avatar */}
            <div className="flex items-center gap-2 cursor-pointer">
              <img
                src={user.anhDaiDien || "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg"}
                alt="avatar"
                className="w-8 h-8 rounded-full border"
              />
              <span className="max-md:hidden text-gray-400">{user.hoTen}</span>
              <ChevronDown className="max-md:hidden w-4 h-4 text-gray-400" />
            </div>

            {/* Dropdown */}
            <div className={` absolute right-[-30px] mt-3 w-48 bg-black/90 shadow-lg rounded-lg border-b py-2 z-50
              transition-all duration-200
            ${openDropdown || "group-hover:opacity-100 group-hover:visible"}
            ${openDropdown ? "opacity-100 visible" : "opacity-0 invisible"}
            `}
            >
              <Link
                to="/trang-ca-nhan"
                className="flex px-4 py-2 text-sm gap-2 text-gray-300 hover:bg-primary/20 hover:border-l border-primary"
              >
                <UserIcon size={18} />
                <span>Trang cá nhân</span>
              </Link>

              <Link
                to="/lich-su-dat-ve"
                className="flex items-center px-4 py-2 gap-2 text-sm text-gray-300 hover:bg-primary/20 hover:border-l border-primary"
              >
                <HistoryIcon size={18} />
                <span>Lịch sử đặt vé</span>
              </Link>

              <Link
                to="/phim-ua-thich"
                className="flex items-center px-4 py-2 gap-2 text-sm text-gray-300 hover:bg-primary/20 hover:border-l border-primary"
              >
                <HeartIcon size={18} />
                <span>Phim yêu thích</span>
              </Link>

              <button
                onClick={() => dispatch(logout())}
                className="flex w-full text-left gap-2 px-4 py-2 text-sm text-red-400 hover:bg-primary/20 hover:border-l border-primary cursor-pointer"
              >
                <LogOutIcon size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>


        )
        }

      </div>

      <MenuIcon className='max-md:ml-4 md:hidden w-8 h-8 cursor-pointer'
        onClick={() => setIsOpen(!isOpen)} />

      {showLogin && <Dangnhap onClose={() => setShowLogin(false)} />}
    </div>
  )
}

export default Navbar
