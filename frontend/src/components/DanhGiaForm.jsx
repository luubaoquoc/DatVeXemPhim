import React, { useState, useEffect } from "react";
import { StarIcon, X } from "lucide-react";
import useApi from "../hooks/useApi";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchPhimBymaPhim } from "../redux/features/phimSlice";


const DanhGiaModal = ({ maPhim, open, onClose }) => {
  const api = useApi(true);
  const dispatch = useDispatch();
  const movie = useSelector((state) => state.phim.current);

  const [rating, setRating] = useState(0);       // sao user chọn
  const [hover, setHover] = useState(0);         // sao hover
  const [loading, setLoading] = useState(false);

  //  Khi mở modal, load đánh giá cũ (nếu có)
  useEffect(() => {
    if (!open) return;

    const fetchOldRating = async () => {
      try {
        const res = await api.get(`/phim/${maPhim}/danhgia`)
        const old = res.data?.data;

        if (old) {
          setRating(old.diem);
        } else {
          setRating(0);
        }
      } catch (err) {
        console.log("Không có đánh giá cũ", err)
      }
    };

    fetchOldRating();
  }, [open, maPhim])

  const handleSubmit = async () => {
    if (rating === 0) return toast.error("Vui lòng chọn số sao");
    setLoading(true);

    try {
      const res = await api.post(`/phim/${maPhim}/danhgia`, { diem: rating });
      toast.success(res.data?.message || "Đánh giá thành công");

      // ❌ Không update local store, fetch lại dữ liệu từ server
      await dispatch(fetchPhimBymaPhim(maPhim));

      onClose();
    } catch (err) {
      console.error("Lỗi khi gửi đánh giá:", err);
      toast.error(err.response?.data?.message || "Gửi đánh giá thất bại");
    } finally {
      setLoading(false);
    }
  };


  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md relative border border-primary/30 shadow-2xl">

        {/* Close button */}
        <button
          className="absolute top-3 right-3 text-gray-300 hover:text-white cursor-pointer"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        <div className="flex justify-center mb-4">
          <img src={movie.poster} alt={movie.tenPhim} className="max-h-88 w-full rounded-lg" />
        </div>

        <h2 className="text-lg font-semibold mb-4 text-primary text-center">{movie.tenPhim}</h2>

        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="flex flex-col border rounded-full p-4 items-center justify-center
           bg-gray-800 w-27 h-27">
            <div className="flex items-center gap-1 mb-1">
              <StarIcon className="size-5 text-primary fill-primary" />
              {movie.rating}
            </div>
            <span className="text-xs">({movie?.danhGias?.length || 0} đánh giá)</span>
          </div>
        </div>

        {/* Star rating */}
        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
            <StarIcon
              key={s}
              size={32}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              className={` size-4 cursor-pointer transition ${(hover || rating) >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-500"
                }`}
            />
          ))}
        </div>


        {/* Submit */}
        <div className="flex justify-center mt-3 gap-4">
          <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-6 rounded-lg font-medium transition cursor-pointer">
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={` p-3 rounded-lg font-medium transition flex justify-center items-center gap-2 cursor-pointer
            ${loading ? "bg-primary/60 cursor-not-allowed" : "bg-primary hover:bg-primary-dull"}`}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {loading ? "Đang gửi..." : "Gửi đánh giá"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default DanhGiaModal;
