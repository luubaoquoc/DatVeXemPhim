import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const RoleRoute = ({ allowRoles, children }) => {
  const { user, loading } = useSelector(state => state.auth)

  if (loading) return null

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (!allowRoles.includes(user.vaiTro)) {
    return <Navigate to="/admin" replace />
  }

  return children
}

export default RoleRoute
