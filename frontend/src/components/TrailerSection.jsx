import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactPlayer from 'react-player'
import BlurCircle from './BlurCircle'
import { PlayCircleIcon } from 'lucide-react'
import { fetchPhims, selectAllPhims } from '../redux/features/phimSlice'
import Loading from './Loading'

const TrailerSection = () => {

  const dispatch = useDispatch()
  const movies = useSelector(selectAllPhims)
  const status = useSelector((state) => state.phim.status)
  const error = useSelector((state) => state.phim.error)

  const [currentTrailer, setCurrentTrailer] = useState(null)

  // fetch data
  useEffect(() => {
    dispatch(fetchPhims({ page: 1, limit: 20, search: '' }))
  }, [dispatch])

  // Set trailer mặc định khi load xong movies
  useEffect(() => {
    if (movies.length > 0) {
      const first = {
        maPhim: movies[0].maPhim,
        trailer: movies[0].trailer,
        image: movies[0].poster
      }
      setCurrentTrailer(first)
    }
  }, [movies])

  if (status === 'loading') return <Loading />

  if (status === 'failed')
    return (
      <div className='flex flex-col items-center justify-center h-64'>
        <h1 className='text-xl font-semibold text-red-500'>Lỗi</h1>
        <p className='text-gray-500'>{error}</p>
      </div>
    )

  const phims = movies.slice(0, 4).map(movie => ({
    maPhim: movie.maPhim,
    trailer: movie.trailer,
    image: movie.poster
  }))

  return (
    <div className='px-6 md:px-16 lg:px-44 py-20 overflow-hidden'>
      <p className='text-gray-300 font-medium text-lg max-w-[960px]'>
        Trailers
      </p>

      <div className='relative mt-6'>
        <BlurCircle top='-100px' right='-100px' />

        {currentTrailer && (
          <ReactPlayer
            src={currentTrailer.trailer}    // dùng src, không dùng src!
            controls={false}
            className='mx-auto max-w-full'
            width='960px'
            height='540px'
          />
        )}
      </div>

      <div className='group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto'>
        {phims.map((trailer) => (
          <div key={trailer.maPhim}
            className='relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition cursor-pointer'
            onClick={() => setCurrentTrailer(trailer)}
          >
            <img src={trailer.image} alt="" className='rounded-lg w-full h-full object-cover brightness-75' />
            <PlayCircleIcon strokeWidth={1.6}
              className='absolute top-1/2 left-1/2 w-5 md:w-8 transform -translate-x-1/2 -translate-y-1/2' />
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrailerSection
