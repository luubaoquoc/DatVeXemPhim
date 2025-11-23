import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BlurCircle from '../components/BlurCircle'
import { Calendar, ChevronRight, Clock, Heart, PlayCircleIcon, StarIcon } from 'lucide-react'
import DateSelect from '../components/DateSelect'
import MoviesCard from '../components/MoviesCard'
import Loading from '../components/Loading'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPhimBymaPhim, fetchPhims, selectPhimBymaPhim } from '../redux/features/phimSlice'
import SuatChieu from '../components/SuatChieu.jsx'
import { formatDate } from '../lib/dateFormat.js'
import TrailerModal from '../components/TrailerModal.jsx'
import useApi from '../hooks/useApi.js'
import toast from 'react-hot-toast'

const ChiTietPhim = () => {
  const { maPhim } = useParams()
  const publicApi = useApi(false)
  const api = useApi(true)
  const dispatch = useDispatch()
  const movie = useSelector((state) => selectPhimBymaPhim(state, maPhim))
  const allMovies = useSelector(state => state.phim.items || [])
  const status = useSelector((state) => state.phim.status)
  const [dateTimeMap, setDateTimeMap] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  const [liked, setLiked] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!hasFetched) {
      dispatch(fetchPhimBymaPhim(maPhim))
      if (!allMovies || allMovies.length === 0) {
        dispatch(fetchPhims())
      }
      setHasFetched(true)
    }
  }, [dispatch, maPhim, allMovies.length, hasFetched])


  useEffect(() => {
    const checkLiked = async () => {
      try {
        const res = await api.get('/phim/liked')
        const likedList = res.data?.data || []
        setLiked(likedList.some(p => p.maPhim === Number(maPhim)))
      } catch (err) {
        console.error("Lỗi khi kiểm tra phim đã thích", err)
      }
    }

    checkLiked()
  }, [maPhim])


  // fetch available dates for this movie from suatchieu API
  useEffect(() => {
    const formatLocalDate = (d) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
    const getDates = async () => {
      const resolvedMaPhim = (movie && (movie.maPhim || movie.maPhim === 0))
        ? movie.maPhim
        : (Number(maPhim) || null)
      if (!resolvedMaPhim) return setDateTimeMap({})

      try {
        const res = await publicApi.get('/suatchieu', { params: { maPhim: resolvedMaPhim, page: 1, limit: 200 } })
        const rows = res.data?.data || res.data || []
        const map = {}
        const toLocalDate = (iso) => {
          if (!iso) return null
          const d = new Date(iso)
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          return `${y}-${m}-${day}`
        }

        rows.forEach(r => {
          const dt = r.gioBatDau ? toLocalDate(r.gioBatDau) : null
          if (!dt) return
          if (!map[dt]) map[dt] = []
          map[dt].push({
            maSuatChieu: r.maSuatChieu,
            gioBatDau: r.gioBatDau,
            giaVeCoBan: r.giaVeCoBan
          })
        })

        // ✅ Lọc chỉ lấy ngày chiếu từ hôm nay trở đi (bỏ qua suất chiếu đã qua)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const filteredMap = {}
        Object.keys(map)
          .filter(k => {
            const d = new Date(k)
            d.setHours(0, 0, 0, 0)
            return d >= today
          })
          .sort((a, b) => new Date(a) - new Date(b))
          .forEach(k => {
            filteredMap[k] = map[k]
          })

        setDateTimeMap(filteredMap)

        // ✅ Nếu hôm nay có suất chiếu thì chọn hôm nay, nếu không thì chọn ngày gần nhất kế tiếp
        if (filteredMap[formatLocalDate(today)]) {
          setSelectedDate(formatLocalDate(today))
        } else if (Object.keys(filteredMap).length > 0) {
          setSelectedDate(Object.keys(filteredMap)[0])
        } else {
          setSelectedDate(null)
        }
      } catch (err) {
        console.error('Lỗi khi lấy ngày chiếu', err)
        setDateTimeMap({})
        setSelectedDate(new Date().toLocaleDateString('sv-SE'))
      }
    }
    getDates()
  }, [movie, maPhim])




  if (!movie || status === 'loading') return <Loading />

  console.log(movie);


  const otherMovies = (Array.isArray(allMovies) ? allMovies : [])
    .filter(m => m.maPhim !== Number(maPhim))  // bỏ phim hiện tại
    .slice(0, 3)  // chỉ lấy 3 phim khác


  const overview = movie.noiDung || movie.overview || ''
  const genres = movie.theLoais || []
  const runtime = movie.thoiLuong || movie.runtime || 0
  const releaseYear = formatDate(movie.ngayCongChieu)

  const toggleLike = async () => {
    try {
      if (liked) {
        const res = await api.delete(`/phim/${maPhim}/like`)
        toast.success(res.data?.message || 'Đã bỏ thích phim')
        setLiked(false)
      } else {
        const res = await api.post(`/phim/${maPhim}/like`)
        toast.success(res.data?.message || 'Đã thích phim')
        setLiked(true)
      }
    } catch (err) {
      console.error("Lỗi khi like/unlike", err)
    }
  }


  return (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      <div className="flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto">

        {/* ==== CỘT TRÁI: CHI TIẾT PHIM + NỘI DUNG + SUẤT CHIẾU ==== */}
        <div className="flex-1">
          {/* Thông tin phim */}
          <div className="flex flex-col md:flex-row gap-8">
            <img
              src={movie.poster}
              alt={movie.tenPhim}
              className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
            />
            <div className="relative flex flex-col gap-3 mt-6">
              <BlurCircle top="-100px" left="-100px" />
              <h1 className="text-4xl font-semibold text-balance">{movie.tenPhim}</h1>
              <p className="flex gap-4">
                <span className="flex items-center gap-1 text-gray-400">
                  <Clock className="size-4 text-primary" /> {runtime} phút
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Calendar className="size-4 text-primary" /> {releaseYear}
                </span>
              </p>

              <p className='text-sm text-white font-bold border bg-gray-700 border-primary rounded-md px-2 py-1 w-9 text-center'>{movie.phanLoai}</p>

              <div className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-primary transition">
                <StarIcon className="size-5 text-primary fill-primary" />
                {movie.rating}
                <span className="text-xs">({movie?.danhGias?.length || 0} lượt đánh giá)</span>
              </div>

              <p className="text-gray-400">
                <span className='text-primary/80'>Thể loại:{" "}</span>
                {genres.map((g, idx) => (
                  <span
                    key={idx}
                    className="inline-block mx-2 border border-primary px-2 py-1 text-xs bg-gray-800 rounded-md text-white/75"
                  >
                    {g.tenTheLoai}
                  </span>
                ))}
              </p>

              <p className="text-gray-400">
                <span className='text-primary/80'>Đạo diễn:{" "}</span>
                <span className="mx-2 border border-primary px-2 py-1 text-xs bg-gray-800 rounded-md text-white/75">
                  {movie.daoDien?.tenDaoDien}
                </span>
              </p>

              <p className="text-gray-400 flex flex-wrap gap-y-2">
                <span className='text-primary/80'>Diễn viên:{" "}</span>
                {movie.dienViens?.map((dv, idx) => (
                  <span
                    key={idx}
                    className="inline-block mx-2 border px-2 py-1 text-xs bg-gray-800 rounded-md text-white/75 border-primary"
                  >
                    {dv.tenDienVien}
                  </span>
                ))}
              </p>

              <div className="flex items-center flex-wrap gap-4 mt-4">
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium active:scale-95 cursor-pointer"
                >
                  <PlayCircleIcon className="size-5" />
                  Xem Trailer
                </button>
                <button
                  onClick={() => {
                    document.getElementById('dateSelect')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="px-10 py-3 text-sm bg-primary/80 hover:bg-primary-dull transition rounded-md font-medium active:scale-95 cursor-pointer"
                >
                  Mua vé
                </button>
                <button
                  onClick={toggleLike}
                  className={`p-2.5 rounded-full transition active:scale-95 cursor-pointer
    ${liked ? "bg-red-600" : "bg-gray-700"}`}
                >
                  <Heart
                    className={`size-5 transition
      ${liked ? "text-red-400 fill-red-400" : ""}`}
                  />
                </button>

              </div>
            </div>
          </div>

          {/* Nội dung phim */}
          <div className="mt-12">
            <h3 className="text-xl font-medium border-l-3 pl-2 border-primary">
              Nội Dung Phim
            </h3>
            <p className="text-gray-400 max-w-4xl mt-2">{overview}</p>
          </div>

          {/* Lịch chiếu */}
          <div id="dateSelect" className="mt-4">
            <DateSelect
              dateTime={dateTimeMap}
              maPhim={maPhim}
              selected={selectedDate}
              onSelect={setSelectedDate}
            />
            <SuatChieu maPhim={movie.maPhim || Number(maPhim)} date={selectedDate} />
          </div>
        </div>

        {/* ==== CỘT PHẢI: PHIM ĐANG CHIẾU ==== */}
        <div className="w-full lg:w-1/4">
          <h3 className="text-xl font-medium mb-4 border-l-3 pl-2 border-primary">
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
      {showTrailer && (
        <TrailerModal
          trailerUrl={movie.trailer}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  )

}

export default ChiTietPhim
