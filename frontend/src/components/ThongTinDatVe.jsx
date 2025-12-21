import React from 'react'
import isoTimeFormat from "../lib/isoTimeFormat";
import { Clock } from 'lucide-react';
import { dateFormat } from '../lib/dateFormat';

const ThongoTinDatVe = (
  { phim,
    phong,
    rap,
    poster,
    seats = [],
    selectedSeats = [],
    selectedTime,
    date,
    giaVeCoBan,
    timeLeft,
    onBack,
    onAction,
    actionLabel = "Thanh toán", }
) => {

  const currency = import.meta.env.VITE_CURRENCY || "đ";
  console.log(phim);




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

      <div className="mt-4 border-t border-gray-700 pt-3 flex justify-between items-center">
        <p className="text-sm text-gray-300">Tổng cộng:</p>
        <p className="font-semibold text-xl text-primary">
          {((selectedSeats?.length || 0) * (giaVeCoBan || 0)).toLocaleString('vi-VN')} {currency}
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
            className="p-2 bg-primary-dull hover:bg-primary text-white rounded w-full cursor-pointer flex items-center justify-center gap-2"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default ThongoTinDatVe
