import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BlurCircle from '../components/BlurCircle'
import { Calendar, ChevronRight, Clock, Heart, PlayCircleIcon, StarIcon } from 'lucide-react'
import DateSelect from '../components/DateSelect'
import MoviesCard from '../components/MoviesCard'
import Loading from '../components/Loading'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPhimBymaPhim, fetchPhims } from '../redux/features/phimSlice'
import SuatChieu from '../components/SuatChieu.jsx'
import { formatDate } from '../lib/dateFormat.js'
import TrailerModal from '../components/TrailerModal.jsx'
import useApi from '../hooks/useApi.js'
import toast from 'react-hot-toast'
import DanhGiaModal from '../components/DanhGiaForm.jsx'
import Dangnhap from '../components/Dangnhap.jsx'
import { clearAuthIntent, setAuthIntent } from '../redux/features/authSlice.js'

const ChiTietPhim = () => {
  const { maPhim } = useParams()
  const api = useApi(true)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth.user)
  const movie = useSelector((state) => state.phim.current)
  const allMovies = useSelector(state => state.phim.items || [])
  const currentStatus = useSelector((state) => state.phim.currentStatus)
  const authIntent = useSelector(state => state.auth.authIntent)
  const [selectedDate, setSelectedDate] = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const [liked, setLiked] = useState(false)
  const [showDanhGia, setShowDanhGia] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedRap, setSelectedRap] = useState('all')



  useEffect(() => {
    dispatch(fetchPhims());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPhimBymaPhim(maPhim));
  }, [dispatch, maPhim]);



  useEffect(() => {
    if (!user) {
      setLiked(false)
      return
    }
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



  useEffect(() => {
    if (!selectedDate) {
      const today = new Date()
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const dd = String(today.getDate()).padStart(2, '0')
      setSelectedDate(`${yyyy}-${mm}-${dd}`)
    }
  }, [])

  useEffect(() => {
    if (!user || !authIntent) return;

    if (
      authIntent.action === 'danhGia' &&
      String(authIntent.maPhim) === String(maPhim)
    ) {
      setShowDanhGia(true);
    }

    if (
      authIntent.action === 'likePhim' &&
      String(authIntent.maPhim) === String(maPhim)
    ) {
      toggleLike(); 
    }

    if (authIntent.action === 'chon-suatChieu') {
      navigate(`/chon-ghe/${authIntent.maSuatChieu}`);
    }

    dispatch(clearAuthIntent());
  }, [user, authIntent, maPhim]);



  if (!movie || currentStatus === 'loading') return <Loading />

  console.log(movie);


  const otherMovies = (Array.isArray(allMovies) ? allMovies : [])
    .filter(m => m.maPhim !== Number(maPhim))
    .slice(0, 3)


  const overview = movie.noiDung || ''
  const genres = movie.theLoais || []
  const runtime = movie.thoiLuong || 0
  const releaseYear = formatDate(movie.ngayCongChieu)

  const handleDanhGiaClick = () => {
    if (!user) {
      dispatch(setAuthIntent({ action: 'danhGia', maPhim }));
      setShowLoginModal(true);
      return;
    }
    setShowDanhGia(true);
  }

  const toggleLike = async () => {
    if (!user) {
      dispatch(setAuthIntent({ action: 'likePhim', maPhim }));
      setShowLoginModal(true)
      return;
    }

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

              <div onClick={handleDanhGiaClick}
                className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-primary transition">
                <StarIcon className="size-5 text-primary fill-primary" />
                {movie.rating}
                <span className="text-xs">({movie?.danhGias?.length || 0} lượt đánh giá)</span>
              </div>
              <p className='text-sm text-white font-bold border bg-gray-700 border-primary rounded-md px-2 py-1 w-9 text-center'>{movie.phanLoai}</p>


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
              maPhim={maPhim}
              selected={selectedDate}
              onSelect={setSelectedDate}
              selectRap={selectedRap}
              onSelectRap={setSelectedRap}
              all={true}
            />
            <SuatChieu
              maPhim={movie.maPhim || Number(maPhim)}
              date={selectedDate}
              maRap={selectedRap}
            />
          </div>
        </div>

        {/* ==== CỘT PHẢI: PHIM ĐANG CHIẾU ==== */}
        <div className="w-full lg:w-1/4">
          <h3 className="text-xl font-medium mb-4 border-l-3 pl-2 border-primary">
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
              className=' flex px-10 py-3 border border-primary bg-primary-dull hover:bg-primary transition rounded-md
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
      {showDanhGia && (
        <DanhGiaModal
          maPhim={maPhim}
          open={showDanhGia}
          onClose={() => setShowDanhGia(false)}
        />
      )}
      {showLoginModal && (
        <Dangnhap
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}


    </div>
  )

}

export default ChiTietPhim
