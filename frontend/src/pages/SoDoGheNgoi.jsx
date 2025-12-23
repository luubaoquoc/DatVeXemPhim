import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ClockIcon } from "lucide-react";
import toast from "react-hot-toast";

import { assets } from "../assets/assets";
import useApi from "../hooks/useApi";
import isoTimeFormat from "../lib/isoTimeFormat";

import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import GheLayout from "../components/GheLayout";
import ThongTinDatVe from "../components/ThongTinDatVe";

const SoDoGheNgoi = () => {

  const { maPhim, maSuatChieu } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const api = useApi(true);
  const publicApi = useApi(false);

  const maDatVe = state?.maDatVe;


  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  /* ====================== LOAD DATA ====================== */

  const loadShow = useCallback(async () => {
    if (!maSuatChieu) return;
    try {
      const { data } = await publicApi.get(`/suatchieu/${maSuatChieu}`);
      setShow(data);
      setSelectedTime(data?.gioBatDau || null);
    } catch (err) {
      console.error("Load show failed:", err);
      toast.error("Không thể tải suất chiếu");
    }
  }, [maSuatChieu, publicApi]);

  const loadSeats = useCallback(async () => {
    const maPhong = show?.phongChieu?.maPhong;
    if (!maPhong) return;

    try {
      const { data } = await api.get("/ghe", { params: { maPhong } });
      const list = data?.items || data || [];

      setSeats(
        list.map(s => ({
          ...s,
          id: `${s.hang}${s.soGhe}`.toUpperCase(),
        }))
      );
    } catch (err) {
      console.error("Load seats failed:", err);
    }
  }, [show, api]);

  const loadBookedSeats = useCallback(async () => {
    if (!maSuatChieu) return;

    try {
      const { data } = await api.get(
        `/datve/ghe-da-dat/${maSuatChieu}`,
        { params: { maDatVe } }
      );

      setBookedSeats(
        (data?.gheDaDat || []).map(s => String(s).toUpperCase())
      );
    } catch (err) {
      console.error("Load booked seats failed:", err);
    }
  }, [maSuatChieu, maDatVe, api]);

  const restoreSelectedSeats = useCallback(async () => {
    if (!maDatVe) return;

    try {
      const { data } = await api.get(`/datve/${maDatVe}/ghes`);
      setSelectedSeats(data.map(s => String(s).toUpperCase()));
    } catch (err) {
      console.error("Restore selected seats failed:", err);
    }
  }, [maDatVe, api]);

  /* ====================== EFFECTS ====================== */

  useEffect(() => { loadShow(); }, [loadShow]);
  useEffect(() => { loadSeats(); }, [loadSeats]);
  useEffect(() => { loadBookedSeats(); }, [loadBookedSeats]);
  useEffect(() => { restoreSelectedSeats(); }, [restoreSelectedSeats]);


  useEffect(() => {
    if (!maDatVe) return;

    const fetchBooking = async () => {
      try {
        const res = await api.get(`/datve/${maDatVe}`);
        const expire = new Date(res.data.thoiHanThanhToan).getTime();
        const diff = Math.floor((expire - Date.now()) / 1000);
        setTimeLeft(Math.max(0, diff));
      } catch (err) {
        console.error('Fetch booking failed:', err);
        toast.error("Đã hết thời gian giữ ghế");
        navigate(`/chon-ghe/${maSuatChieu}`);
      }
    };

    fetchBooking();
  }, [maDatVe]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      toast.error("Đã hết thời gian giữ ghế!");

      setSelectedSeats([]);
      setBookedSeats([]);
      setTimeLeft(null);

      loadBookedSeats();

      navigate(`/chon-ghe/${maSuatChieu}`, { replace: true });
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate, maSuatChieu, loadBookedSeats]);

  useEffect(() => {
    const interval = setInterval(loadBookedSeats, 3000);
    return () => clearInterval(interval);
  }, [loadBookedSeats]);



  /* ====================== HANDLERS ====================== */

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    if (!selectedTime) return toast.error("Vui lòng chọn giờ chiếu");
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      return toast.error("Chỉ chọn tối đa 5 ghế");
    }

    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    );
  };

  const buildChiTiet = () => {
    return selectedSeats.map(seatId => {
      const seat = seats.find(s => s.id === seatId);
      if (!seat) throw new Error(`Ghế không hợp lệ: ${seatId}`);

      return {
        maGhe: seat.maGhe,
        giaVe: show.giaVeCoBan,
      };
    });
  };

  const handleThanhToan = async () => {
    if (!selectedSeats.length) return toast.error("Vui lòng chọn ghế");

    try {
      const chiTiet = buildChiTiet();

      // UPDATE
      if (maDatVe) {
        await api.put(`/datve/${maDatVe}/ghes`, { seats: chiTiet });

        navigate("/thanh-toan", {
          state: {
            maDatVe,
            maSuatChieu,
            maPhim,
            selectedSeats,
            pricePerSeat: show.giaVeCoBan,
            phim: show.phim,
            phong: show.phongChieu,
            gioBatDau: show.gioBatDau,
          },
        });
        return;
      }

      // CREATE
      const { data } = await api.post("/datve", {
        maSuatChieu,
        tongTien: selectedSeats.length * show.giaVeCoBan,
        chiTiet,
      });

      navigate("/thanh-toan", {
        state: {
          maDatVe: data.maDatVe,
          thoiHanThanhToan: data.thoiHanThanhToan,
          maSuatChieu,
          maPhim,
          selectedSeats,
          pricePerSeat: show.giaVeCoBan,
          phim: show.phim,
          phong: show.phongChieu,
          gioBatDau: show.gioBatDau,
        },
      });
    } catch (err) {
      toast.error(err?.message || "Đặt vé thất bại");
    }
  };

  /* ====================== RENDER ====================== */

  if (!show) return <Loading />;

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-40">
      <div className="flex flex-col flex-2">
        <div className="flex items-center bg-primary/10 border border-primary/20 rounded-lg py-2">
          <p className="text-lg font-semibold px-6">Suất chiếu</p>
          <div className="flex items-center gap-4 px-6">
            <ClockIcon className="w-4 h-4" />
            <p className="text-sm">
              {show.gioBatDau ? isoTimeFormat(show.gioBatDau) : "Chưa có giờ"}
            </p>
            <span className="text-gray-300">-</span>
            <p className="text-sm text-gray-300">
              Phòng: <span className="text-primary">{show.phongChieu?.tenPhong}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 items-center justify-center text-sm mt-5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary-dull rounded" />Ghế đã bán</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded" /> Ghế đang chọn</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary/20 rounded" /> Ghế trống</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            Khóa / Hỏng
          </div>
        </div>

        <div className="relative flex-1 flex flex-col items-center mt-10">
          <BlurCircle top="-100px" left="-100px" />
          <BlurCircle bottom="0" right="0" />

          <img src={assets.screenImage} className="mt-6 rounded-lg shadow-2xl shadow-red-400" />
          <p className="text-gray-300 text-sm mb-6">Màn hình</p>

          <GheLayout
            seats={seats}
            bookedSeats={bookedSeats}
            selectedSeats={selectedSeats}
            onSelectSeat={seat => handleSeatClick(seat.id)}
            mode="booking"
          />
        </div>
      </div>

      <div className="flex flex-1 justify-center md:justify-end mt-10 md:mt-0">
        <ThongTinDatVe
          phim={show.phim}
          phong={show.phongChieu}
          rap={show.phongChieu?.rap}
          poster={show.phim?.poster}
          date={show.gioBatDau}
          seats={seats}
          selectedSeats={selectedSeats}
          selectedTime={selectedTime}
          giaVeCoBan={show.giaVeCoBan}
          timeLeft={timeLeft}
          onBack={() => navigate(-1)}
          onAction={handleThanhToan}
          actionLabel="Tiếp tục"
        />
      </div>
    </div>
  );
};

export default SoDoGheNgoi;
