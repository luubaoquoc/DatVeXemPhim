import React, { useEffect, useState } from "react";
import useApi from "../../hooks/useApi";
import Loading from "../../components/Loading";
import { Link } from "react-router-dom";
import { TicketIcon, CalendarCheck2, ScanLineIcon, ReceiptTextIcon, CircleDollarSignIcon, StarIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPhims, selectAllPhims } from "../../redux/features/phimSlice";
import MoviesCard from "../MoviesCard";
import timeFormat from "../../lib/timeFormat";

const NhanVienDashBoard = () => {
  const api = useApi(true);
  const currency = import.meta.env.VITE_CURRENCY;
  const [data, setData] = useState(null);

  const dispatch = useDispatch()
  const phim = useSelector(selectAllPhims)
  console.log(phim);


  useEffect(() => {
    api.get("/admin/dashboard").then(res => {
      setData(res.data.cards);
    });
  }, []);

  useEffect(() => {
    dispatch(fetchPhims({ page: 1, limit: 20, search: '' }))
  }, [dispatch])

  const dangChieu = phim.filter((m) => m.trangThaiChieu === 'Đang chiếu');


  if (!data) return <Loading />;

  const Card = ({ icon, label, value, color }) => (
    <div className="p-6 bg-black rounded-xl border border-primary shadow-md">
      <div className="flex items-center justify-center gap-3">
        <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <p className="text-gray-400 text-lg">{label}</p>
      </div>
      <h2 className="text-2xl font-bold mt-1 text-center">{value}</h2>
    </div>
  );

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-12">

        <h1 className="text-2xl font-semibold">
          Dashboard Nhân viên
        </h1>
        <div className="flex gap-4">
          <Link to="/admin/van-hanh/check-in" className="border border-primary px-4 py-2 rounded-md bg-primary hover:bg-primary-dull">
            Check-in vé
          </Link>
          <Link to="/admin/van-hanh/ban-ve-tai-quay" className="border border-primary px-4 py-2 rounded-md bg-primary hover:bg-primary-dull">
            Bán vé tại quầy
          </Link>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card
          icon={<CircleDollarSignIcon />}
          label="Doanh thu hôm nay"
          value={data.doanhThu.toLocaleString() + " " + currency}
          color="text-green-500"
        />
        <Card
          icon={<TicketIcon />}
          label="Vé bán hôm nay"
          value={data.veBanHomNay}
          color="text-blue-500"
        />
        <Card
          icon={<CalendarCheck2 />}
          label="Suất chiếu hôm nay"
          value={data.suatChieuHomNay}
          color="text-yellow-500"
        />

        <Card icon={<ScanLineIcon />} label="Check-in" value="Hoạt động" color="text-blue-300" />
      </div>




      <div>
        <h2 className="text-2xl font-semibold mt-12 mb-6">Phim đang chiếu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {dangChieu.map((movie) => (
            <div key={movie.maPhim}>
              <div className='flex flex-col justify-between p-3 bg-gray-900 rounded-2xl
    hover:-translate-y-1 transition duration-300 w-66 relative'>
                <img
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

                  <p className='flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1'>
                    {movie.rating || '0.0'}
                    <StarIcon className='size-4 text-primary fill-primary' />
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};



export default NhanVienDashBoard;
