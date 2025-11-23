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
import AddShows from './pages/admin/AddShows'
import ListShows from './pages/admin/ListShows'
import ListBookings from './pages/admin/ListBookings'
import ProtectedRoute from './components/ProtectedRoute'
import TrangCaNhan from './pages/TrangCaNhan'
import QuanLyphim from './pages/admin/QuanLyphim'
import ScrollToTop from './components/ScrollToTop'
import AdminRoute from './components/admin/AdminRoute'
import DaoDien from './pages/DaoDien'
import QuanLyDaoDien from './pages/admin/DaoDien'
import QuanLyDienVien from './pages/admin/DienVien'
import QuanLyTheLoai from './pages/admin/TheLoai'
import Rap from './pages/admin/Rap'
import PhongChieu from './pages/admin/PhongChieu'
import DienVien from './pages/DienVien'
import TheLoai from './pages/TheLoai'
import Banner from './pages/admin/Banner'

const App = () => {


  const isAdminRoute = useLocation().pathname.startsWith('/admin')
  return (
    <>
      <ScrollToTop />
      <Toaster />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path='/' element={<TrangChu />} />
        <Route path='/phims' element={<Phims />} />
        <Route path='/phims/:maPhim' element={<ChiTietPhim />} />
        <Route path='/dao-dien' element={<DaoDien />} />
        <Route path='/dien-vien' element={<DienVien />} />
        <Route path='/the-loai' element={<TheLoai />} />
        <Route path='/phims/:maPhim' element={<ChiTietPhim />} />

        <Route
          path="/chon-ghe/:maSuatChieu"
          element={
            <ProtectedRoute>
              <SoDoGheNgoi />
            </ProtectedRoute>
          } />

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

        <Route path='/admin/*'
          element={
            <AdminRoute>
              <Layout />
            </AdminRoute>
          }>
          <Route index element={<Dashboard />} />
          <Route path='phims' element={<QuanLyphim />} />
          <Route path='dao-dien' element={<QuanLyDaoDien />} />
          <Route path='dien-vien' element={<QuanLyDienVien />} />
          <Route path='the-loai' element={<QuanLyTheLoai />} />
          <Route path='banner' element={<Banner />} />
          <Route path='rap' element={<Rap />} />
          <Route path='phong-chieu' element={<PhongChieu />} />
          <Route path='add-shows' element={<AddShows />} />
          <Route path='list-shows' element={<ListShows />} />
          <Route path='list-bookings' element={<ListBookings />} />
        </Route>

      </Routes>
      {!isAdminRoute && <Footer />}

    </>
  )
}

export default App
