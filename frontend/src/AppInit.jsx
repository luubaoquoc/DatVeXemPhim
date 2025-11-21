import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { refreshAuth } from './redux/features/authSlice'
import Loading from './components/Loading'

export default function InitApp({ children }) {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.auth.loading)

  useEffect(() => {
    dispatch(refreshAuth())
  }, [dispatch])

  if (loading) return (
    <Loading />
  )

  return children
}
