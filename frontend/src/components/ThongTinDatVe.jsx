import React from 'react'
import isoTimeFormat from "../lib/isoTimeFormat";
import { Clock } from 'lucide-react';
import { dateFormat } from '../lib/dateFormat';

const ThongTinDatVe = (
  { phim,
    phong,
    rap,
    poster,
    seats = [],
    selectedSeats = [],
    selectedTime,
    date,
    giaVeCoBan,
    selectedCombos = [],
    comboTotal = 0,
    discount = 0,
    finalTotal,
    timeLeft,
    onBack,
    onAction,
    actionLabel = "Thanh toán",
    loading = false,
  }
) => {

  const currency = import.meta.env.VITE_CURRENCY || "đ";
  const total = ((selectedSeats?.length || 0) * (giaVeCoBan || 0));


  const tongThanhToan = typeof finalTotal === 'number' ? finalTotal : total;

  console.log(selectedCombos);


  return (
    <div className="bg-primary/10 border-t-3 border-primary rounded-lg p-2 w-full md:w-[350px] h-max text-white">
      <div className='flex mt-1'>
        <img
          src={poster || phim?.poster}
          alt={phim?.tenPhim || "Poster"}
          className="rounded-lg mb-4 w-40 h-60 object-contain mr-4"
        />
        <div>
          <h2 className="font-semibold text-lg mb-2">
            {phim?.tenPhim || "Phim"}
          </h2>
          <p className='text-sm text-white font-bold border bg-gray-700 border-primary rounded-md px-2 py-1 w-9 text-center'>{phim?.phanLoai || "N/A"}</p>
        </div>
      </div>
      <div className="mb-4">

        <p className="text-sm text-gray-300">
          Phòng: <span className="text-primary">{phong?.tenPhong || "N/A"}</span>
          {rap && (
            <>
              <span className="text-gray-400"> • </span>
              <span className="text-gray-300">
                Rạp: <span className="text-primary">{rap.tenRap}</span>
              </span>
            </>
          )}
        </p>
      </div>

      <div className="flex gap-2 items-center">
        <p className="text-sm text-gray-300">
          Suất:{" "}
          <span className="text-primary">
            {selectedTime ? isoTimeFormat(selectedTime) : "Chưa chọn"}
          </span>
        </p>
        <span>-</span>
        <p className="text-sm text-gray-300">
          Ngày: <span className="text-primary">{dateFormat(date)}</span>
        </p>
      </div>

      <div className="mt-4 border-t border-gray-700 pt-3">
        <p className="text-sm text-gray-300 mb-1">
          Ghế đã chọn:{" "}
          <span className="text-primary font-bold">
            {selectedSeats?.length > 0
              ? selectedSeats
                .map(seatId => {
                  // tìm ghế trong seats (truyền từ SoDoGheNgoi)
                  const s = seats.find(s => s.maGhe === seatId);
                  return s ? `${s.hang}${s.soGhe}` : seatId;
                })
                .join(", ")
              : "Chưa chọn"
            }
          </span>
        </p>

      </div>

      <div>
        <div className="mt-4 border-t border-gray-700 pt-3 flex justify-between items-center">
          <p className="text-sm text-gray-300">Tạm tính:</p>
          <p className="font-semibold text-xl text-primary">
            {total.toLocaleString('vi-VN')} {currency}
          </p>
        </div>

      </div>
      {selectedCombos.length > 0 && (
        <div className="mt-3 border-t border-gray-700 pt-3">


          <div className="space-y-1 text-sm">
            {selectedCombos.map(c => (
              <div
                key={c.maCombo}
                className="flex justify-between text-gray-300"
              >
                <span>
                  {c.ComBoDoAn?.tenCombo} <span className='font-bold text-primary'>× {c.soLuong}</span>
                </span>
                <span>
                  {(c.soLuong * c.giaTaiThoiDiem).toLocaleString('vi-VN')} {currency}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-2 font-semibold text-primary">
            <span>Tổng combo:</span>
            <span>{comboTotal.toLocaleString('vi-VN')} {currency}</span>
          </div>
        </div>
      )}

      {discount > 0 && (
        <div className="mt-2 border-t border-gray-700 pt-3 flex justify-between items-center">
          <p className="text-sm text-gray-300">Giảm giá:</p>
          <p className="font-semibold text-xl text-primary">
            -{discount.toLocaleString('vi-VN')} {currency}
          </p>
        </div>
      )}
      <div className="mt-4 border-t border-gray-700 pt-3 flex justify-between items-center">
        <p className="text-sm text-gray-300">Tổng cộng:</p>
        <p className="font-semibold text-xl text-primary">
          {tongThanhToan.toLocaleString('vi-VN')} {currency}
        </p>
      </div>

      {timeLeft && (
        <div className="mt-4 flex items-center justify-center text-sm text-red-400 font-semibold">
          <Clock className="inline-block size-4 mr-1" />
          <span>Thời gian giữ ghế: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
        </div>
      )}

      <div className="flex gap-3 mt-5 border-t border-gray-700 pt-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 border rounded w-full hover:bg-gray-800 cursor-pointer"
          >
            Quay lại
          </button>
        )}
        {onAction && (
          <button
            onClick={onAction}
            disabled={loading}
            className={`p-2 text-white rounded w-full cursor-pointer flex items-center justify-center gap-2
              ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </>
            )
              : actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default ThongTinDatVe
