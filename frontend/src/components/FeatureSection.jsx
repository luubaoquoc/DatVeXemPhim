import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlurCircle from './BlurCircle';
import MoviesCard from './MoviesCard';
import Loading from './Loading';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPhims, selectAllPhims } from '../redux/features/phimSlice';

const FeatureSection = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const movies = useSelector(selectAllPhims)
  const status = useSelector((state) => state.phim.status)
  const error = useSelector((state) => state.phim.error)

  const [activeTab, setActiveTab] = useState('dangChieu')

  useEffect(() => {
    dispatch(fetchPhims({ page: 1, limit: 20, search: '' }))
  }, [dispatch])

  if (status === 'loading') return <Loading />;

  if (status === 'failed')
    return (
      <div className='flex flex-col items-center justify-center h-64'>
        <h1 className='text-xl font-semibold text-red-500'>Lỗi</h1>
        <p className='text-gray-500'>{error}</p>
      </div>
    );

  const dangChieu = movies.filter((m) => m.trangThaiChieu === 'Đang chiếu');
  const sapChieu = movies.filter((m) => m.trangThaiChieu === 'Sắp chiếu');



  const renderMovies = (list) => (
    <>
      <div className='flex flex-wrap max-md:justify-center gap-8 mt-6'>
        {list.slice(0, 4).map((movie) => (
          <MoviesCard key={movie.maPhim} movie={movie} />
        ))}
      </div>
      {list.length > 4 && (
        <div className='flex justify-center mt-8'>
          <button
            onClick={() => {
              navigate('/phims');
              scrollTo(0, 0);
            }}
            className='px-10 py-3 bg-primary-dull hover:bg-primary transition rounded-md font-medium cursor-pointer'
          >
            Xem thêm
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>
      {/* Tab */}
      <div className='flex gap-4 mt-20 justify-center '>
        <button
          onClick={() => setActiveTab('dangChieu')}
          className={`py-2 text-2xl font-medium transition cursor-pointer ${activeTab === 'dangChieu'
            ? 'border-b-2 border-primary text-white'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Phim đang chiếu
        </button>
        <span className='text-2xl pt-2'>|</span>
        <button
          onClick={() => setActiveTab('sapChieu')}
          className={`py-2 text-2xl font-medium transition cursor-pointer ${activeTab === 'sapChieu'
            ? 'border-b-2 border-primary text-white'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Phim sắp chiếu
        </button>
      </div>

      {/* Content */}
      <div className='relative'>
        <BlurCircle top='0' right='-80px' />
        {activeTab === 'dangChieu' && renderMovies(dangChieu)}
        {activeTab === 'sapChieu' && renderMovies(sapChieu)}
      </div>
    </div>
  );
};

export default FeatureSection
