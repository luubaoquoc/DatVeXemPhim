import React from 'react'
import MoviesCard from '../components/MoviesCard'
import BlurCircle from '../components/BlurCircle'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPhims, selectAllPhims } from '../redux/features/phimSlice'
import { useEffect } from 'react'
import Loading from '../components/Loading'

const PhimUaThich = () => {

  const dispatch = useDispatch()
  const movies = useSelector(selectAllPhims)
  const status = useSelector((state) => state.phim.status)
  const error = useSelector((state) => state.phim.error)

  useEffect(() => {
    if (status === 'idle' || movies.length === 0) {
      dispatch(fetchPhims())
    }
  }, [dispatch, status, movies.length])

  if (status === 'loading') return (
    <Loading />
  )

  if (status === 'failed') return (
    <div className='flex flex-col items-center justify-center h-64'>
      <h1 className='text-xl font-semibold text-red-500'>Lỗi</h1>
      <p className='text-gray-500'>{error}</p>
    </div>
  )
  return movies.length > 0 ? (
    <div className='relative my-40 mb-60 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>

      <BlurCircle top='150px' left='0px' />
      <BlurCircle bottom='50px' right='50px' />
      <h1 className='text-2xl font-medium my-6'>Phim ưa thích của tôi</h1>
      <div className='flex flex-wrap max-sm:justify-center gap-8'>
        {movies.map((movie) => (
          <MoviesCard key={movie.maPhim} movie={movie} />
        ))}
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-3xl font-bold text-center'>No movies available</h1>
    </div>
  )
}

export default PhimUaThich
