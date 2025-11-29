import React from "react";
import { formatDate } from "../lib/dateFormat";
import isoTimeFormat from "../lib/isoTimeFormat";

const ChiTietLichSuDatVe = (
  { bookings, onClose }
) => {
  // if (!phim) return null;

  console.log(bookings);

  const suatChieu = bookings.suatChieu;
  const phongChieu = suatChieu?.phongChieu;
  const phim = bookings.suatChieu?.phim;
  const chiTietDatVes = bookings.chiTietDatVes || [];

  const gheDaDat = chiTietDatVes.map(item => {
    const ghe = item.ghe;
    return `${ghe.hang}${ghe.soGhe}`;
  }).join(", ");

  const thanhToan = bookings.thanhToan || {};
  console.log(phim);

  const isSuccess = thanhToan.trangThai === 'Thành công' || bookings.trangThai === 'Thành công'



  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-black/90 border border-primary p-6 rounded-xl w-[750px] text-white max-h-[90vh] overflow-y-auto no-scrollbar">

        <h2 className="text-2xl font-semibold mb-4 text-center bg-gradient-to-r from-primary to-yellow-200 bg-clip-text text-transparent">
          Chi tiết vé đặt
        </h2>

        <div className="flex gap-6">
          <img
            src={phim?.poster}
            alt={phim?.tenPhim}
            className="w-50 h-66 object-contain rounded"
          />

          <div className="flex space-y-2">
            <div className="border-x p-2 space-y-1">
              <h4 className="text-center mb-2 text-primary font-medium text-xl">Thông tin vé</h4>
              <p><span className="text-primary">Mã đặt vé: </span> {bookings.maDatVe}</p>
              <p><span className="text-primary">Tên phim: </span> {phim?.tenPhim}</p>
              <p><span className="text-primary">Ngày đặt: </span> {new Date(bookings.ngayDat).toLocaleString()}</p>
              <p><span className="text-primary">Ngày chiếu: </span>{formatDate(suatChieu.gioBatDau)}</p>
              <p><span className="text-primary">Giờ bắt đầu: </span>{isoTimeFormat(suatChieu.gioBatDau)}</p>
              <p><span className="text-primary">Giờ kết thúc: </span>{isoTimeFormat(suatChieu.gioKetThuc)}</p>
              <p><span className="text-primary">Phòng chiếu: </span> {phongChieu?.tenPhong}</p>
              <p><span className="text-primary">Ghế đã đặt: </span> {gheDaDat}</p>
            </div>
            <div className=" p-2">
              <h4 className="text-center mb-2 text-primary font-medium text-xl">Thông tin thanh toán</h4>
              <p className="font-semibold mb-1 text-primary">Mã thanh toán: {thanhToan.maThanhToan}</p>
              <p><span className="text-primary">Tổng tiền: </span> {Number(bookings.tongTien).toLocaleString('vi-VN')} VND</p>
              <p><span className="text-primary">Phương thức: </span> {thanhToan.phuongThuc || 'N/A'}</p>
              <p><span className="text-primary">Ngày thanh toán: </span> {thanhToan.ngayThanhToan ? new Date(thanhToan.ngayThanhToan).toLocaleString() : 'N/A'}</p>
              <p><span className="text-primary">Trạng thái: </span> <b className={isSuccess ? 'text-green-500' : 'text-red-400'}>
                {thanhToan.trangThai || bookings.trangThai}
              </b></p>
            </div>
          </div>
        </div>



        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

export default ChiTietLichSuDatVe;
