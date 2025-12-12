import React, { useEffect, useState } from 'react'
import useApi from '../hooks/useApi'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import MoviesCard from '../components/MoviesCard'
import { ChevronRight } from 'lucide-react'
import { fetchPhims } from '../redux/features/phimSlice'
import BlurCircle from '../components/BlurCircle'

const TheLoai = () => {

  const api = useApi(false)
  const navigate = useNavigate()
  const [theLoais, setTheLoais] = useState([])
  const allMovies = useSelector(state => state.phim.items || [])
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchPhims())
  }, [])

  const fetchTheLoais = async () => {
    try {
      const response = await api.get('/theloai')
      setTheLoais(response.data.data)
    } catch (error) {
      console.error('Error fetching the loais:', error)
    }
  }

  useEffect(() => {
    fetchTheLoais()
  }, [])

  const otherMovies = (Array.isArray(allMovies) ? allMovies : [])
    .slice(0, 3)
  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      <div className="flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto">
        <BlurCircle top='100px' left='100px' />
        <BlurCircle bottom='0px' right='100px' />
        <div className="flex-2">
          <h2 className="text-2xl font-medium mb-8 lg:text-left border-l-3 border-primary pl-2">Thể Loại</h2>
          <div className="flex flex-row flex-wrap gap-3">
            {theLoais.map((theloai) => (
              <div key={theloai.maTheLoai} className="bg-black/30 rounded-lg overflow-hidden shadow-lg border border-primary/30 px-4 py-2">
                <span>{theloai.tenTheLoai}</span>
              </div>
            ))}
          </div>
        </div>
        {/* ==== CỘT PHẢI: PHIM ĐANG CHIẾU ==== */}
        <div className="w-full lg:w-1/4">
          <h3 className="text-xl font-medium mb-8 border-l-3 pl-2 border-primary">
            Phim đang chiếu
          </h3>
          <div className="flex flex-col gap-6">
            {otherMovies.length > 0
              ? otherMovies.map((m, idx) => (
                <MoviesCard key={idx} movie={m} />
              ))
              : (
                <p className="text-gray-400 text-sm">Hiện chưa có phim khác</p>
              )}
          </div>
          <div className='flex justify-center mt-5'>
            <button onClick={() => { navigate('/phims'); scrollTo(0, 0) }}
              className=' flex px-10 py-3 border border-primary hover:bg-primary-dull transition rounded-md
          font-medium cursor-pointer'>
              Xem thêm
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TheLoai
