import React, { useEffect, useMemo, useState } from "react";
import useApi from "../../hooks/useApi";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";
import GheLayout from "../../components/GheLayout";

const QuanLyGhe = () => {
  const api = useApi(true);
  const [phongChieus, setPhongChieus] = useState([]);
  const [maPhong, setMaPhong] = useState("");
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all"); // all / active / locked

  // fetch danh sách phòng
  const fetchPhong = async () => {
    try {
      const res = await api.get("/phongchieu", { params: { page: 1, limit: 9999 } });
      setPhongChieus(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không tải được danh sách phòng");
    }
  };

  // fetch ghế theo phòng
  const fetchSeats = async (mp) => {
    if (!mp) return setSeats([]);
    setLoading(true);
    try {
      const res = await api.get("/ghe", { params: { maPhong: mp } });
      const data = res.data.items || res.data || [];
      // chuẩn hóa ghế
      const normalized = data.map(s => ({
        ...s,
        maGhe: s.maGhe || `${s.hang}${s.soGhe}`,
        hang: s.hang,
        soGhe: s.soGhe,
        trangThai: !!s.trangThai
      }));
      setSeats(normalized);
    } catch (err) {
      console.error(err);
      toast.error("Lấy ghế thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPhong(); }, []);
  useEffect(() => {
    setSeats([]);
    fetchSeats(maPhong);
  }, [maPhong]);

  // toggle trạng thái ghế
  const toggleSeat = async (seat) => {
    const newState = !seat.trangThai;
    // optimistic UI
    setSeats(prev => prev.map(s => s.maGhe === seat.maGhe ? { ...s, trangThai: newState } : s));
    try {
      await api.put(`/ghe/${seat.maGhe}`, { trangThai: newState });
      toast.success(`Cập nhật ghế ${seat.hang}${seat.soGhe}`);
    } catch (err) {
      setSeats(prev => prev.map(s => s.maGhe === seat.maGhe ? { ...s, trangThai: seat.trangThai } : s));
      
      if (err.response?.data?.needConfirm) {
        const confirm = window.confirm("Ghế này đã được đặt cho suất chiếu tương lai. Bạn có chắc chắn muốn khóa ghế không?");
        if (confirm) {
          try {
            await api.put(`/ghe/${seat.maGhe}`, { trangThai: newState, force: true });
            setSeats(prev =>
      prev.map(s =>
        s.maGhe === seat.maGhe
          ? { ...s, trangThai: newState }
          : s
      )
    );
            toast.success(`Cập nhật ghế ${seat.hang}${seat.soGhe}`);
          } catch (err) {
            setSeats(prev => prev.map(s => s.maGhe === seat.maGhe ? { ...s, trangThai: seat.trangThai } : s));
            toast.error(err.response?.data?.message || "Cập nhật thất bại");
          }
        }
      } else {
        toast.error(err.response?.data?.message || "Cập nhật thất bại");
      }
    }
  };

  // filter seats
  const filteredSeats = useMemo(() => {
    if (filterStatus === "all") return seats;
    const wantActive = filterStatus === "active";
    return seats.filter(s => s.trangThai === wantActive);
  }, [seats, filterStatus]);

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Quản lý ghế</h1>
        <button
          onClick={() => { fetchSeats(maPhong); toast.success("Làm mới"); }}
          className="px-3 py-2 bg-primary rounded flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <select
          value={maPhong}
          onChange={(e) => setMaPhong(e.target.value)}
          className="border border-primary/70 px-3 py-2 bg-black h-[3rem] outline-none cursor-pointer"
        >
          <option value="">-- Chọn phòng --</option>
          {phongChieus.map(p => (
            <option key={p.maPhong} value={p.maPhong}>{p.tenPhong} ({p.tongSoGhe} ghế)</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-primary/70 px-3 py-2 bg-black h-[3rem] outline-none cursor-pointer"
        >
          <option value="all">Tất cả</option>
          <option value="active">Khả dụng</option>
          <option value="locked">Khóa</option>
        </select>
      </div>

      {/* Legend */}
      <div className="flex gap-4 items-center mb-4 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-primary/60 rounded" /> Khả dụng</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-400 rounded" /> Khóa / Hỏng</div>
      </div>

      {/* Seat layout */}
      <div className="overflow-auto border border-primary/30 p-4 rounded bg-black/60">
        {loading && <div className="text-center py-8">Đang tải ghế...</div>}
        {!loading && !maPhong && <div className="text-center py-8">Vui lòng chọn phòng để xem sơ đồ ghế</div>}
        {!loading && maPhong && filteredSeats.length === 0 && <div className="text-center py-4">Không có ghế phù hợp với bộ lọc</div>}

        {!loading && maPhong && filteredSeats.length > 0 && (
          <GheLayout
            seats={filteredSeats}
            mode="management"
            onToggle={toggleSeat}
          />
        )}
      </div>
    </div>
  );
};

export default QuanLyGhe;
