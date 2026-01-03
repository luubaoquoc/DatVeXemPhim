import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import TrangChu from './pages/TrangChu'
import Phims from './pages/Phims'
import ChiTietPhim from './pages/ChiTietPhim'
import SoDoGheNgoi from './pages/SoDoGheNgoi'
import LichSuDatVe from './pages/LichSuDatVe'
import ThanhToan from './pages/ThanhToan'
import PhimUaThich from './pages/PhimUaThich'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import TrangCaNhan from './pages/TrangCaNhan'
import QuanLyphim from './pages/admin/QuanLyphim'
import ScrollToTop from './components/ScrollToTop'
import AdminRoute from './components/admin/AdminRoute'
import DaoDien from './pages/DaoDien'
import QuanLyDaoDien from './pages/admin/QuanLyDaoDien'
import QuanLyDienVien from './pages/admin/QuanLyDienVien'
import QuanLyTheLoai from './pages/admin/QuanLyTheLoai'
import QuanLyRap from './pages/admin/QuanLyRap'
import PhongChieu from './pages/admin/QuanLyPhongChieu'
import DienVien from './pages/DienVien'
import TheLoai from './pages/TheLoai'
import Banner from './pages/admin/Banner'
import QuanLyGhe from './pages/admin/QuanLyGhe'
import QuanLySuatChieu from './pages/admin/QuanLySuatChieu'
import QuanLyDonDatVe from './pages/admin/QuanLyDonDatVe'
import QuanLyTaiKhoan from './pages/admin/QuanLyTaiKhoan'
import QuanLyDanhGia from './pages/admin/QuanLyDanhGia'
import CheckInVe from './pages/admin/CheckInVe'
import BanVeTaiQuay from './pages/admin/BanVeTaiQuay'
import LichSuBanVe from './pages/admin/LichSuBanVe'
import GioiThieu from './pages/GioiThieu'
import LienHe from './pages/LienHe'
import ChinhSachBaoMat from './pages/ChinhSachBaoMat'
import LichChieu from './pages/LichChieu'
import ChiTietLichChieu from './pages/ChiTietLichChieu'
import Rap from './pages/Rap'
import DatVeThanhCong from './pages/DatVeThanhCong'
import QuanLyKhuyenMai from './pages/admin/QuanLyKhuyenMai'
import RoleRoute from './components/admin/RoleRoute'
import ChatWidget from './components/ChatWidget'
import GoiYPhim from './pages/GoiYPhim'

const App = () => {


  const isAdminRoute = useLocation().pathname.startsWith('/admin')
  return (
    <>
      <ScrollToTop />
      <Toaster />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path='/' element={<TrangChu />} />
        <Route path='/gioi-thieu' element={<GioiThieu />} />
        <Route path='/chinh-sach-bao-mat' element={<ChinhSachBaoMat />} />
        <Route path='/lien-he' element={<LienHe />} />
        <Route path='/phims' element={<Phims />} />
        <Route path='/phims/:maPhim' element={<ChiTietPhim />} />
        <Route path='/lich-chieu' element={<LichChieu />} />
        <Route path='/lich-chieu/:maRap' element={<ChiTietLichChieu />} />
        <Route path='/dao-dien' element={<DaoDien />} />
        <Route path='/dien-vien' element={<DienVien />} />
        <Route path='/the-loai' element={<TheLoai />} />
        <Route path='/raps/:maRap' element={<Rap />} />

        <Route
          path="/chon-ghe/:maSuatChieu"
          element={
            <ProtectedRoute>
              <SoDoGheNgoi />
            </ProtectedRoute>
          } />


        <Route
          path="/dat-ve-thanh-cong"
          element={
            <ProtectedRoute>
              <DatVeThanhCong />
            </ProtectedRoute>
          }
        />

        <Route
          path='/trang-ca-nhan'
          element={
            <ProtectedRoute>
              <TrangCaNhan />
            </ProtectedRoute>
          } />
        <Route
          path='/lich-su-dat-ve'
          element={
            <ProtectedRoute>
              <LichSuDatVe />
            </ProtectedRoute>
          } />
        <Route
          path='/thanh-toan'
          element={
            <ProtectedRoute>
              <ThanhToan />
            </ProtectedRoute>
          } />
        <Route
          path='/phim-ua-thich'
          element={
            <ProtectedRoute>
              <PhimUaThich />
            </ProtectedRoute>
          } />

        <Route path='/goi-y-phim' element={<GoiYPhim />} />



        {/* Admin routes */}
        <Route path='/admin/*'
          element={
            <AdminRoute>
              <Layout />
            </AdminRoute>
          }>
          <Route index element={<Dashboard />} />
          <Route path='van-hanh/check-in' element={<CheckInVe />} />
          <Route path='van-hanh/ban-ve-tai-quay' element={<BanVeTaiQuay />} />
          <Route path='van-hanh/lich-su-ban-ve' element={<LichSuBanVe />} />
          <Route path='quan-ly-phim'
            element={
              <RoleRoute allowRoles={[4]}>
                <QuanLyphim />
              </RoleRoute>

            }
          />
          <Route path='quan-ly-dao-dien'
            element={
              <RoleRoute allowRoles={[4]}>
                <QuanLyDaoDien />
              </RoleRoute>
            }
          />
          <Route path='quan-ly-dien-vien'
            element={
              <RoleRoute allowRoles={[4]}>
                <QuanLyDienVien />
              </RoleRoute>
            }
          />
          <Route path='quan-ly-the-loai'
            element={
              <RoleRoute allowRoles={[4]}>
                <QuanLyTheLoai />
              </RoleRoute>
            }
          />
          <Route path='quan-ly-danh-gia'
            element={
              <RoleRoute allowRoles={[4]}>
                <QuanLyDanhGia />
              </RoleRoute>
            }
          />
          <Route path='banner'
            element={
              <RoleRoute allowRoles={[4]}>
                <Banner />
              </RoleRoute>
            }
          />
          <Route path='quan-ly-rap'
            element={
              <RoleRoute allowRoles={[4]}>
                <QuanLyRap />
              </RoleRoute>
            }
          />
          <Route path='quan-ly-phong-chieu'
            element={
              <RoleRoute allowRoles={[3, 4]}>
                <PhongChieu />
              </RoleRoute>
            }
          />
          <Route path='quan-ly-ghe'
            element={
              <RoleRoute allowRoles={[3, 4]}>
                <QuanLyGhe />
              </RoleRoute>
            }
          />
          <Route path='quan-ly-suat-chieu'
            element={
              <RoleRoute allowRoles={[3, 4]}>
                <QuanLySuatChieu />
              </RoleRoute>
            }
          />
          <Route path='quan-ly-don-dat-ve' element={<QuanLyDonDatVe />} />
          <Route path='quan-ly-khuyen-mai'
            element={
              <RoleRoute allowRoles={[4]}>
                <QuanLyKhuyenMai />
              </RoleRoute>
            }
          />
          <Route path='quan-ly-tai-khoan'
            element={
              <RoleRoute allowRoles={[3, 4]}>
                <QuanLyTaiKhoan />
              </RoleRoute>
            }
          />
        </Route>

      </Routes>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ChatWidget />}

    </>
  )
}

export default App
