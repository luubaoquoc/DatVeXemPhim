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
                {phong.suatChieus.map((sc) => (
                  <button
                    key={sc.maSuatChieu}
                    onClick={() => onSelectShow(sc.maSuatChieu)}
                    className="px-3 py-2 bg-gray-800 hover:bg-primary transition rounded text-sm"
                  >
                    {new Date(sc.gioBatDau).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SuatChieuPOS;
