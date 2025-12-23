import React, { useEffect, useState } from "react";
import useApi from "../../hooks/useApi";
import toast from "react-hot-toast";

const SuatChieuPOS = ({ maPhim, date, onSelectShow }) => {
  const api = useApi(true);

  const [loading, setLoading] = useState(false);
  const [raps, setRaps] = useState([]);

  const fetchRaps = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/suatchieu/raps`, {
        params: { maPhim, date },
      });
      setRaps(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải suất chiếu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (maPhim && date) fetchRaps();
  }, [maPhim, date]);

  const isPastShowtime = (gioBatDau, date) => {
    const now = new Date()

    const showTime = new Date(gioBatDau)

    // nếu không phải hôm nay → luôn hợp lệ
    const todayStr = now.toISOString().slice(0, 10)
    if (date !== todayStr) return false

    return showTime <= now
  }

  if (loading) return <div className="text-gray-300 p-4">Đang tải...</div>;

  if (raps.length === 0)
    return <div className="text-gray-400">Không có suất chiếu</div>;

  return (
    <div>
      {raps.map((rap) => (
        <div key={rap.maRap} className="mb-6 border-b border-gray-700 pb-4">
          <h2 className="text-xl font-semibold text-primary">{rap.tenRap}</h2>

          {rap.phongChieus.map((phong) => (
            <div key={phong.maPhong} className="mt-3 pl-4">
              <h3 className="text-lg font-medium">{phong.tenPhong}</h3>

              <div className="flex flex-wrap gap-3 mt-2">
                {phong.suatChieus.map((sc) => {

                  const isPast = isPastShowtime(sc.gioBatDau, date);

                  return (
                    <button
                      key={sc.maSuatChieu}
                      disabled={isPast}
                      onClick={() => onSelectShow(sc.maSuatChieu)}
                      className={` px-4 py-2 border rounded transition
                            ${isPast
                          ? 'bg-gray-700/50 text-gray-400 border-gray-600 cursor-not-allowed'
                          : 'bg-white/5 hover:bg-primary/90 border-primary/30 cursor-pointer'
                        }
                          `}
                    >
                      {new Date(sc.gioBatDau).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SuatChieuPOS;
