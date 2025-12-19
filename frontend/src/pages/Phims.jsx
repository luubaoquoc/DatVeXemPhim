import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import MoviesCard from '../components/MoviesCard'
import BlurCircle from '../components/BlurCircle'
import { fetchPhims, selectAllPhims } from '../redux/features/phimSlice'
import Loading from '../components/Loading'

const Phims = () => {
  const dispatch = useDispatch()
  const movies = useSelector(selectAllPhims)
  const status = useSelector((state) => state.phim.status)
  const error = useSelector((state) => state.phim.error)

  const [activeTab, setActiveTab] = useState('dangChieu')

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPhims({ page: 1, limit: 20, search: '' }))
    }
  }, [dispatch, status, movies.length])
  if (status === 'loading') return <Loading height="100vh" />

  if (status === 'failed') return (
    <div className='flex flex-col items-center justify-center h-64'>
      <h1 className='text-xl font-semibold text-red-500'>Lỗi</h1>
      <p className='text-gray-500'>{error}</p>
    </div>
  )

  const dangChieu = movies.filter((m) => m.trangThaiChieu === 'Đang chiếu');
  const sapChieu = movies.filter((m) => m.trangThaiChieu === 'Sắp chiếu');


  const renderMovies = (list) => (
    <div className='flex flex-wrap justify-start max-lg:justify-center gap-8 mt-8'>
      {list.map((movie) => (
        <MoviesCard key={movie.maPhim} movie={movie} />
      ))}
    </div>

  );
  return movies && movies.length > 0 ? (
    <div className='relative my-20 mb-20 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>

      <BlurCircle top='150px' left='0px' />
      <BlurCircle bottom='50px' right='50px' />
      <div className='flex gap-4 mt-10 justify-start'>
        <h1 className='p-2 text-2xl font-semibold text-white border-l-2 border-primary'>PHIM</h1>
        <button
          onClick={() => setActiveTab('dangChieu')}
          className={`py-2 text-xl font-medium transition cursor-pointer ${activeTab === 'dangChieu'
            ? 'border-b-2 border-primary text-white'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Đang chiếu
        </button>
        <span className='text-2xl pt-2'>|</span>
        <button
          onClick={() => setActiveTab('sapChieu')}
          className={`py-2 text-xl font-medium transition cursor-pointer ${activeTab === 'sapChieu'
            ? 'border-b-2 border-primary text-white'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Sắp chiếu
        </button>
      </div>
      <div className='relative'>
        <BlurCircle top='0' right='-80px' />
        {activeTab === 'dangChieu' && renderMovies(dangChieu)}
        {activeTab === 'sapChieu' && renderMovies(sapChieu)}
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-3xl font-bold text-center'>No movies available</h1>
    </div>
  )
}

export default Phims
