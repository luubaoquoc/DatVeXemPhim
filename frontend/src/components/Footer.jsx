import { Facebook, Instagram, Mail, PhoneCall, Youtube } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="px-6 md:px-16 lg:px-36 mt-10 w-full text-gray-300">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b
       border-gray-500 pb-14">

        {/* Logo + mô tả */}
        <div className="md:max-w-96">
          <Link to='/' className='max-md:flex-1'>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-[#20B2AA] to-yellow-300/50 bg-clip-text text-transparent'>
              Go Cinema
            </h1>
          </Link>

          <p className="mt-6 text-sm leading-relaxed">
            <span className='text-primary'>Go Cinema</span> mang đến trải nghiệm đặt vé xem phim nhanh chóng, tiện lợi và hiện đại.
            Thưởng thức những bộ phim hay nhất với chất lượng dịch vụ tốt nhất.
          </p>

          <div className="flex items-center gap-2 mt-4">
            <img
              src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/appDownload/googlePlayBtnBlack.svg"
              alt="google play"
              className="h-10 w-auto border border-white rounded"
            />
            <img
              src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/appDownload/appleStoreBtnBlack.svg"
              alt="app store"
              className="h-10 w-auto border border-white rounded"
            />
          </div>
        </div>

        {/* Menu liên kết */}
        <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
          <div>
            <h2 className="font-semibold mb-5 text-2xl">Về chúng tôi</h2>
            <ul className="text-sm space-y-2 text-gray-400 ">
              <li><Link to="/" className='hover:text-primary'>Trang chủ</Link></li>
              <li><Link to="/gioi-thieu" className='hover:text-primary'>Giới thiệu</Link></li>
              <li><Link to="/lien-he" className='hover:text-primary'>Liên hệ</Link></li>
              <li><Link to="/chinh-sach-bao-mat" className='hover:text-primary'>Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h2 className="font-semibold mb-5 text-2xl">Liên hệ</h2>
            <div className="text-sm space-y-2 text-gray-400">
              <p className='flex items-center gap-2'><PhoneCall className='text-red-400' /> 0939 779 138</p>
              <p className='flex items-center gap-2'><Mail /> gocinema.@gmail.com</p>
              <p className='mt-4'>
                <Facebook className='inline-block mr-2 text-blue-400 hover:text-blue-600 cursor-pointer' />
                <Youtube className='inline-block text-red-400 hover:text-red-600 cursor-pointer' />
                <Instagram className='inline-block ml-2 text-pink-500 hover:text-pink-700 cursor-pointer' />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bản quyền */}
      <p className="pt-4 text-center text-sm pb-5">
        Copyright {new Date().getFullYear()} © <span className="text-white font-semibold">LuuBaoQuocDev</span>.
        Uy tín - Chất lượng - An toàn.
      </p>
    </footer>
  )
}

export default Footer
