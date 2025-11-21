import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth)
  const location = useLocation()

  // Nếu chưa đăng nhập → quay về trang chủ
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // Nếu đăng nhập rồi → cho phép truy cập
  return children
}

export default ProtectedRoute
