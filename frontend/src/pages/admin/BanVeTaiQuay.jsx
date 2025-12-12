import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPhims, selectAllPhims } from "../../redux/features/phimSlice";
import Loading from "../../components/Loading";
import DanhSachPhim from "../../components/admin/DanhSachPhim";
import GheLayout from "../../components/GheLayout";
import ThongTinDatVe from "../../components/ThongTinDatVe";
import useApi from "../../hooks/useApi";
import toast from "react-hot-toast";
// import { generateTicketPDF } from "../../utils/generateTicketPDF";
import BlurCircle from "../../components/BlurCircle";
import { inVe } from "../../utils/inVe";

const BanVeTaiQuay = () => {
  const dispatch = useDispatch();
  const api = useApi(true);

  const movies = useSelector(selectAllPhims);
  const status = useSelector((state) => state.phim.status);

  const [step, setStep] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);



  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPhims({ page: 1, limit: 20, search: "" }));
    }
  }, [dispatch, status]);


  if (status === "loading") return <Loading height="100vh" />;

  const dangChieu = movies.filter((m) => m.trangThaiChieu === "Đang chiếu");


  const loadSeats = async (maSuatChieu) => {
    try {
      const sc = await api.get(`/suatchieu/${maSuatChieu}`);
      const maPhong = sc.data.phongChieu.maPhong;
      setSelectedMovie(sc.data);

      const res = await api.get(`/ghe`, { params: { maPhong } });
      const normalized = res.data.map(s => ({
        ...s,
        id: s.id || `${s.hang}${s.soGhe}`,
        hang: s.hang,
        soGhe: s.soGhe,
        trangThai: typeof s.trangThai === 'boolean' ? s.trangThai : !!s.trangThai
      }))
      setSeats(normalized || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải sơ đồ ghế");
    }
  };

  const loadBookedSeats = async (maSuatChieu) => {
    try {
      const res = await api.get(`/datve/ghe-da-dat/${maSuatChieu}`);
      const booked = (res.data.gheDaDat || res.data || []).map(s => String(s).trim().toUpperCase());
      setBookedSeats(booked);
    } catch (err) {
      console.error('Lỗi khi tải ghế đã đặt:', err);
      setBookedSeats([]);
    }
  };


  const handleSelectShow = (maSuatChieu) => {
    setSelectedShow(maSuatChieu);
    loadSeats(maSuatChieu);
    loadBookedSeats(maSuatChieu);
    setStep(2);
  };


  const toggleSeat = (seat) => {
    const seatId = `${seat.hang}${seat.soGhe}`;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handlePayment = async () => {
    try {
      const res = await api.post("/datve/thanhtoan", {
        maSuatChieu: selectedShow,
        seats: selectedSeats.map(seatId => {
          const s = seats.find(s => `${s.hang}${s.soGhe}` === seatId);
          return {
            maGhe: s.maGhe,
            giaVe: selectedMovie?.giaVeCoBan
          };
        }),
      });

      console.log(res.data);


      toast.success("In vé thành công!");
      setStep(1);
      // Reset POS
      setSelectedSeats([]);
      setSelectedShow(null);
      setSelectedMovie(null);
      inVe(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Thanh toán lỗi");
    }
  };

  return (
    <div className="p-6 text-white">
      <BlurCircle top='100px' left='100px' />
      <BlurCircle bottom='0px' right='100px' />
      <h1 className="text-3xl font-bold mb-6">Bán vé tại quầy (POS)</h1>

      {step === 1 && (
        <DanhSachPhim
          movies={dangChieu}
          onSelectShow={handleSelectShow}
        />
      )}

      {step === 2 && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-3">Chọn ghế</h2>

            <GheLayout
              seats={seats}
              bookedSeats={bookedSeats}
              selectedSeats={selectedSeats}
              onSelectSeat={toggleSeat}
            />

            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border rounded mt-4"
            >
              Quay lại
            </button>
          </div>

          <ThongTinDatVe
            phim={selectedMovie?.phim}
            phong={selectedMovie?.phongChieu}
            rap={selectedMovie?.phongChieu?.rap}
            poster={selectedMovie?.phim?.poster}
            date={selectedMovie?.gioBatDau}
            selectedTime={selectedMovie?.gioBatDau}
            seats={seats}
            selectedSeats={selectedSeats}
            giaVeCoBan={selectedMovie?.giaVeCoBan}
            actionLabel="Thanh toán & In vé"
            onAction={handlePayment}
          />
        </div>
      )}
    </div>
  );
};

export default BanVeTaiQuay;
