import { StarIcon } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import timeFormat from '../lib/timeFormat'

const MoviesCard = ({ movie }) => {
  console.log(movie);

  const navigate = useNavigate()
  return (
    <div className='flex flex-col justify-between p-3 bg-gray-900 rounded-2xl
    hover:-translate-y-1 transition duration-300 w-66 relative'>
      <img onClick={() => { navigate(`/phims/${movie.maPhim}`); scrollTo(0, 0) }}
        src={movie.poster} alt="" className='rounded-lg h-70 w-full object-center
       cursor-pointer' />
      <div className="absolute top-3 right-3 w-9 bg-primary/80 rounded-lg p-1">
        <p className='text-sm text-center text-white'>{movie.phanLoai}</p>
      </div>
      <p className='font-medium mt-2 truncate'>{movie.tenPhim}</p>

      <p className='text-sm text-gray-400 mt-2'>
        {new Date(movie.ngayCongChieu).getFullYear()} - {movie.theLoais.slice(0, 2).map(
          genre => genre.tenTheLoai).join(" | ")} - {timeFormat(movie.thoiLuong)}
      </p>

      <div className='flex items-center justify-between mt-4 pb-3'>
        <button onClick={() => { navigate(`/phims/${movie.maPhim}`); scrollTo(0, 0) }}
          className='px-4 py-2 text-sm bg-primary hover:bg-primary-dull transition
        rounded-full font-medium cursor-pointer'>
          Mua vé
        </button>
        <p className='flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1'>
          {movie.rating || '0.0'}
          <StarIcon className='size-4 text-primary fill-primary' />
        </p>
      </div>
    </div>
  )
}

export default MoviesCard
