import React, { useEffect, useState } from 'react'
import useApi from '../hooks/useApi'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import MoviesCard from '../components/MoviesCard'
import { ChevronRight, SearchIcon } from 'lucide-react'
import { fetchPhims } from '../redux/features/phimSlice'
import Pagination from '../components/admin/Paginnation'
import { formatDate } from '../lib/dateFormat'
import SearchInput from '../components/SearchInput'
import BlurCircle from '../components/BlurCircle'

const DaoDien = () => {

  const api = useApi(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [daoDiens, setDaoDiens] = useState([])
  const allMovies = useSelector(state => state.phim.items || [])
  const [search, setSearch] = useState('')
  const currentPage = Number(searchParams.get("page")) || 1
  const setCurrentPage = (page) => {
    setSearchParams({
      page,
      search,
    });
  }
  const [totalPages, setTotalPages] = useState(1)
  const limit = 6

  useEffect(() => {
    dispatch(fetchPhims())
  }, [])

  const fetchDaoDiens = async () => {
    try {
      const response = await api.get('/daodien', {
        params: { page: currentPage, limit, search }
      })
      setDaoDiens(response.data.data)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('lỗi tải danh sách đạo diễn:', error)
    }
  }

  useEffect(() => {
    fetchDaoDiens()
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, search])

  const otherMovies = (Array.isArray(allMovies) ? allMovies : [])
    .slice(0, 3)
  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      <div className="flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto">
        <BlurCircle top='100px' left='100px' />
        <BlurCircle bottom='0px' right='100px' />
        <div className="flex-2">
          <h2 className="text-2xl font-medium mb-8 lg:text-left border-l-3 border-primary pl-2">Đạo Diễn</h2>

          <SearchInput
            item="đạo diễn"
            search={search}
            onSearch={(value) => {
              setSearch(value)
              setSearchParams({
                page: 1,
                search: value,
              })
            }}
          />
          <div className="flex flex-col gap-3">
            {daoDiens.map((daoDien) => (
              <div key={daoDien.maDaoDien} className="bg-black/30 rounded-lg overflow-hidden shadow-lg flex gap-3">
                <img
                  src={daoDien.anhDaiDien || "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"}
                  alt={daoDien.tenDaoDien}
                  className="w-48 h-48 object-cover rounded-lg"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{daoDien.tenDaoDien}</h3>
                  <p className='mb-2'><span className='text-primary font-medium'>Ngày sinh: </span> {daoDien.ngaySinh ? formatDate(daoDien.ngaySinh) : "Chưa cập nhật"}</p>
                  <p className="text-gray-400"><span className='text-primary'>Tiểu sử: </span>{daoDien.tieuSu ? daoDien.tieuSu : 'Chưa cập nhật'}</p>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
        {/* ==== CỘT PHẢI: PHIM ĐANG CHIẾU ==== */}
        <div className="w-full lg:w-1/4">
          <h3 className="text-xl font-medium mb-8 border-l-3 pl-2 border-primary">
            Phim đang chiếu
          </h3>
          <div className="flex flex-row flex-wrap lg:flex-col gap-6">
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

export default DaoDien
