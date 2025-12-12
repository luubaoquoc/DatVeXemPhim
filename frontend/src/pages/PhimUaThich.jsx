import React, { useEffect, useState } from 'react'
import MoviesCard from '../components/MoviesCard'
import { logout } from '../redux/features/authSlice'
import BlurCircle from '../components/BlurCircle'
import Loading from '../components/Loading'
import useApi from '../hooks/useApi'
import { useDispatch, useSelector } from 'react-redux'
import ProfileSidebar from '../components/ProfileSidebar'

const PhimUaThich = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [movies, setMovies] = useState([])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const api = useApi(true)

  useEffect(() => {
    const fetchLiked = async () => {
      try {
        setStatus('loading')
        const res = await api.get('/phim/liked')
        setMovies(res.data.data || [])
        setStatus('succeeded')
      } catch (err) {
        setStatus('failed')
        setError(err.response?.data?.message || 'Lỗi tải phim ưa thích')
      }
    }

    fetchLiked()
  }, [])

  if (status === 'loading') return <Loading />

  if (status === 'failed') return (
    <div className='flex flex-col items-center justify-center h-64'>
      <h1 className='text-xl font-semibold text-red-500'>Lỗi</h1>
      <p className='text-gray-500'>{error}</p>
    </div>
  )

  return (
    <div className="relative my-40 mb-20 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-screen">
      <div className="flex flex-col md:flex-row max-md:px-10">
        {/* LEFT CARD */}
        <div className="flex-1">
          <ProfileSidebar user={user} dispatch={dispatch} logout={logout} />
        </div>
        <BlurCircle top='100px' left='100px' />
        <BlurCircle bottom='0px' right='400px' />
        {/* RIGHT CARD */}
        <div className="flex-2 bg-black/30 p-8 shadow-lg border-l border-primary/20 w-full">
          <h3 className="text-lg font-semibold text-white mb-6">Phim ưa thích</h3>
          <div className='flex flex-wrap gap-6 justify-center  h-[60vh] overflow-y-auto no-scrollbar'>
            {movies.length === 0 ? (
              <p className='text-gray-400 mt-10'>Bạn chưa thích phim nào.</p>
            ) : (
              movies.map(movie => (
                <MoviesCard key={movie.id} movie={movie} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default PhimUaThich
