import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth)
  const location = useLocation()

  // Chưa đăng nhập → về trang chủ
  if (!user) {
    toast.error('Vui lòng đăng nhập để truy cập trang quản trị!')
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // Không phải admin → chặn truy cập
  if (user.maVaiTro !== 4) {
    toast.error('Bạn không có quyền truy cập trang quản trị!')
    return <Navigate to="/" replace />
  }

  // Là admin → cho phép truy cập
  return children
}

export default AdminRoute
