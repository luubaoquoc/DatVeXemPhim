import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

const AdminRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth)
  const location = useLocation()

  if (loading) return null // Hoặc hiển thị spinner/loading indicator

  // Chưa đăng nhập → về trang chủ
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // Không phải admin → chặn truy cập
  if (user.vaiTro !== 4 && user.vaiTro !== 3 && user.vaiTro !== 2) {
    return <Navigate to="/" replace />
  }

  // Là admin → cho phép truy cập
  return children
}

export default AdminRoute
