import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useApi from "../hooks/useApi";
import ThongTinDatVe from "../components/ThongTinDatVe";

const ComBoDoAn = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const api = useApi(true);

  const { maDatVe } = state || {};

  const [combos, setCombos] = useState([]);
  const [selectedCombos, setSelectedCombos] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);


  /* ================= LOAD ================= */

  useEffect(() => {
    if (!maDatVe) return navigate("/");

    const load = async () => {
      try {
        const [allCombo, myCombo] = await Promise.all([
          api.get("/combodoan/combos"),
          api.get(`/combodoan/${maDatVe}/combos`)
        ]);

        setCombos(allCombo.data);
        setSelectedCombos(myCombo.data);
      } catch {
        toast.error("Không tải được combo");
      }
    };

    load();
  }, [maDatVe]);

  useEffect(() => {
    if (!maDatVe) return;

    const fetchBooking = async () => {
      try {
        const res = await api.get(`/datve/${maDatVe}`);
        const expire = new Date(res.data.thoiHanThanhToan).getTime();
        const diff = Math.floor((expire - Date.now()) / 1000);
        setTimeLeft(Math.max(0, diff));
      } catch {
        toast.error("Hết thời gian giữ ghế");
        navigate(`/chon-ghe/${state.maSuatChieu}`);
      }
    };

    fetchBooking();
  }, [maDatVe]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      toast.error("Hết thời gian giữ ghế!");
      navigate(`/chon-ghe/${state.maSuatChieu}`, {
        state: { maDatVe }
      });
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);


  /* ================= HANDLER ================= */

  const updateCombo = async (maCombo, soLuong) => {
    try {
      await api.post(`/combodoan/${maDatVe}/combos`, { maCombo, soLuong });

      const { data } = await api.get(`/combodoan/${maDatVe}/combos`);
      setSelectedCombos(data);
    } catch {
      toast.error("Cập nhật combo thất bại");
    }
  };

  const handleContinue = () => {
    navigate("/thanh-toan", {
      state: {
        ...state,
        selectedCombos,
        comboTotal,
        finalTotal
      }
    });
  };

  /* ================= TOTAL ================= */

  const seatTotal = (state.selectedSeats?.length || 0) * (state.pricePerSeat || 0);

  const comboTotal = selectedCombos.reduce(
    (sum, c) => sum + c.soLuong * c.giaTaiThoiDiem,
    0
  );

  const finalTotal = seatTotal + comboTotal;


  /* ================= RENDER ================= */

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-40">
      <div className="flex-2 bg-primary/10 border border-primary/20 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Chọn combo</h2>

        <div className="flex flex-col gap-4">
          {combos.map(combo => {
            const current = selectedCombos.find(c => c.maCombo === combo.maCombo);
            const soLuong = current?.soLuong || 0;

            return (
              <div key={combo.maCombo} className="w-full h-auto border rounded-lg p-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img
                      src={combo.hinhAnh}
                      alt={combo.tenCombo}
                      className="w-40 h-25 object-cover rounded-md"
                    />
                    <div>
                      <h3 className="font-semibold">{combo.tenCombo}</h3>
                      <p className="text-sm text-gray-400">{combo.moTa}</p>
                      <p>
                        <span className="text-primary font-bold">
                          {combo.gia.toLocaleString()} đ
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mr-4">
                    <button onClick={() => updateCombo(combo.maCombo, Math.max(0, soLuong - 1))}>-</button>
                    <span>{soLuong}</span>
                    <button onClick={() => updateCombo(combo.maCombo, soLuong + 1)}>+</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 justify-end">
        <ThongTinDatVe
          phim={state.phim}
          phong={state.phong}
          rap={state.phong?.rap}
          poster={state.poster}
          seats={state.seats || []}
          selectedSeats={state.selectedSeats}
          selectedTime={state.gioBatDau}
          date={state.gioBatDau}
          giaVeCoBan={state.pricePerSeat}
          selectedCombos={selectedCombos}
          comboTotal={comboTotal}
          finalTotal={finalTotal}
          timeLeft={timeLeft}
          onBack={() =>
            navigate(`/chon-ghe/${state.maSuatChieu}`, {
              state: { maDatVe }
            })
          }
          onAction={handleContinue}
          actionLabel="Tiếp tục"
        />
      </div>
    </div>
  );
};

export default ComBoDoAn;
