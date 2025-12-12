import React, { useState } from "react";
import useApi from "../../hooks/useApi";
import toast from "react-hot-toast";
import { Search, TicketCheck, Clock, Film, Armchair, X } from "lucide-react";

const CheckInVe = () => {
  const api = useApi(true);

  const [maChiTiet, setMaChiTiet] = useState("");
  const [ve, setVe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // BƯỚC 1: LẤY THÔNG TIN VÉ
  const handleSearch = async () => {
    if (!maChiTiet.trim()) {
      toast.error("Vui lòng nhập mã đặt vé");
      return;
    }

    setLoading(true);

    try {
      const res = await api.get(`/datve/${maChiTiet}/checkin`);
      setVe(res.data);
      setOpenModal(true); // mở modal khi tìm được vé
      toast.success("Đã tìm thấy vé!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không tìm thấy vé");
      setVe(null);
    } finally {
      setLoading(false);
    }
  };

  // BƯỚC 2: CHECK-IN
  const handleCheckIn = async () => {
    try {
      const res = await api.post(`/datve/${maChiTiet}/checkin`);
      toast.success(res.data.message || "Check-in thành công");

      setVe((prev) => ({ ...prev, trangThai: "Đã check-in" }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi check-in");
    }
  };

  const ghe = ve
    ? `${ve.ghe?.hang}${ve.ghe?.soGhe}`
    : "";


  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-3xl font-bold mb-6 ">Quét & Check-in Vé</h1>

      {/* INPUT + BUTTON */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={maChiTiet}
          onChange={(e) => setMaChiTiet(e.target.value)}
          placeholder="Nhập mã đặt vé..."
          className="border p-3 w-3/4 rounded focus:ring focus:ring-blue-300 outline-none"
        />

        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-primary hover:bg-primary-dull text-white w-1/4 font-semibold px-5 py-3 rounded flex items-center gap-2 transition cursor-pointer"
        >
          {loading ? (
            <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
          ) : (
            <Search size={18} />
          )}
          <span>Kiểm tra</span>
        </button>
      </div>

      {/* ======================= MODAL THÔNG TIN VÉ ======================= */}
      {openModal && ve && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black/80 rounded-2xl shadow-2xl w-120 p-6 border border-primary relative">

            {/* NÚT ĐÓNG */}
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 cursor-pointer"
              onClick={() => setOpenModal(false)}
            >
              <X size={24} />
            </button>

            <h2 className="font-bold text-2xl mb-4 flex items-center gap-2 justify-center">
              <TicketCheck className="text-blue-600" />
              Thông tin vé
            </h2>

            <div className="space-y-3 text-gray-700">
              <p className="flex items-center gap-2 text-white">
                <TicketCheck size={18} className="text-blue-600" />
                <b>Mã vé:</b> {ve.maChiTiet}
              </p>

              <p className="flex items-center gap-2 text-white">
                <Film size={18} className="text-red-600" />
                <b>Tên phim:</b> {ve.datVe?.suatChieu?.phim?.tenPhim}
              </p>

              <p className="flex items-center gap-2 text-white">
                <Clock size={18} className="text-orange-600" />
                <b>Suất chiếu:</b> {ve.datVe?.suatChieu?.gioBatDau}
              </p>

              <p className="flex items-center gap-2 text-white">
                <Armchair size={18} className="text-green-600" />
                <b>Ghế:</b>{ghe}

              </p>

              <p>
                <b>Trạng thái:</b>{" "}
                <span
                  className={
                    ve.trangThai === "Đã check-in"
                      ? "text-green-600 font-semibold"
                      : "text-yellow-600 font-semibold"
                  }
                >
                  {ve.trangThai}
                </span>
              </p>
            </div>

            {/* BUTTON CHECK-IN */}
            {ve.trangThai !== "Đã check-in" && (
              <button
                onClick={handleCheckIn}
                className="bg-primary hover:bg-primary-dull text-white px-4 py-3 rounded-xl w-full mt-5 font-semibold transition cursor-pointer"
              >
                XÁC NHẬN CHECK-IN
              </button>
            )}

            {ve.trangThai === "Đã check-in" && (
              <div className="mt-5 p-3 rounded-xl bg-white/80 text-primary text-center font-semibold">
                Vé đã được check-in
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInVe;
