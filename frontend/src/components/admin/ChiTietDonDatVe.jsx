import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addRobotoFont } from "../../lib/fonts";



const ChiTietDonDatVe = ({ bookings, onClose }) => {
  if (!bookings) return null;

  const suatChieu = bookings.suatChieu;
  const phongChieu = suatChieu?.phongChieu;
  const phim = suatChieu?.phim;
  const chiTietDatVes = bookings.chiTietDatVes || [];

  const gheDaDat = chiTietDatVes
    .map((item) => `${item.ghe.hang}${item.ghe.soGhe}`)
    .join(", ");

  const thanhToan = bookings.thanhToan || {};
  const isSuccess =
    thanhToan.trangThai === "Thành công" ||
    bookings.trangThai === "Thành công";

  console.log('booking', bookings);

  console.log('suatchieu', suatChieu);
  console.log('phongchieu', phongChieu);
  console.log('phim', phim);
  console.log('chiTietDatVes', chiTietDatVes);
  console.log('ghe', gheDaDat);
  console.log('thanhToan', thanhToan);


  // ---------------------------------------------
  // 📌 HÀM XUẤT FILE VÉ XEM PHIM (PDF)
  // ---------------------------------------------
  const generateTicketPDF = async () => {
    if (!chiTietDatVes.length) return;

    const doc = new jsPDF();
    await addRobotoFont(doc);
    doc.setFont("Roboto", "normal");

    chiTietDatVes.forEach((item, index) => {
      const ghe = `${item.ghe.hang}${item.ghe.soGhe}`;

      // Nếu không phải trang đầu -> thêm trang mới
      if (index > 0) {
        doc.addPage();
      }

      // Tiêu đề
      doc.setFontSize(20);
      doc.setTextColor(30, 144, 255);
      doc.text("VÉ XEM PHIM", 70, 20);

      // Thông tin phim
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Tên phim: ${phim?.tenPhim}`, 20, 35);
      doc.text(`Mã đặt vé: ${bookings.maDatVe}`, 20, 45);

      // Suất chiếu
      doc.text(`Ngày chiếu: ${suatChieu?.gioBatDau?.slice(0, 10)}`, 20, 55);
      doc.text(
        `Giờ chiếu: ${suatChieu?.gioBatDau?.slice(11, 16)} - ${suatChieu?.gioKetThuc?.slice(11, 16)}`,
        20,
        65
      );

      // Ghế & phòng
      doc.text(`Phòng chiếu: ${phongChieu?.tenPhong}`, 20, 75);
      doc.text(`Ghế: ${ghe}`, 20, 85);

      // Thanh toán
      doc.text(`Giá vé: ${Number(item.giaVe).toLocaleString()} VND`, 20, 95);
      doc.text(`Phương thức: ${thanhToan.phuongThuc || "N/A"}`, 20, 105);
      doc.text(
        `Trạng thái: ${isSuccess ? "Thành công" : "Thất bại"}`,
        20,
        115
      );

      // Bảng thông tin
      autoTable(doc, {
        startY: 130,
        head: [["Thông tin", "Giá trị"]],
        body: [
          ["Ghế", ghe],
          ["Phòng chiếu", phongChieu?.tenPhong],
          ["Ngày thanh toán", thanhToan.ngayThanhToan ? new Date(thanhToan.ngayThanhToan).toLocaleString() : "N/A"],
          ["Mã thanh toán", thanhToan.maThanhToan || "N/A"],
        ],
      });
    });

    // Lưu 1 file duy nhất
    doc.save(`VeXemPhim-${bookings.maDatVe}.pdf`);
  };



  // -------------------------------------------------------

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-black/90 border border-primary p-6 rounded-xl w-[750px] text-white max-h-[90vh] overflow-y-auto no-scrollbar">

        <h2 className="text-2xl font-semibold mb-4 text-center bg-gradient-to-r from-primary to-yellow-200 bg-clip-text text-transparent">
          Chi tiết vé đặt
        </h2>

        {/* Nội dung */}
        <div className="flex gap-6">
          <img
            src={phim?.poster}
            alt={phim?.tenPhim}
            className="w-50 h-66 object-contain rounded"
          />

          <div className="flex space-x-3">
            <div className="border-x p-2 space-y-1 w-1/2">
              <h4 className="text-center mb-2 text-primary font-medium text-xl">
                Thông tin vé
              </h4>
              <p><span className="text-primary">Mã đặt vé:</span> {bookings.maDatVe}</p>
              <p><span className="text-primary">Tên phim:</span> {phim?.tenPhim}</p>
              <p><span className="text-primary">Ngày chiếu:</span> {suatChieu?.gioBatDau?.slice(0, 10)}</p>
              <p><span className="text-primary">Giờ chiếu:</span> {suatChieu?.gioBatDau?.slice(11, 16)}</p>
              <p><span className="text-primary">Phòng chiếu:</span> {phongChieu?.tenPhong}</p>
              <p><span className="text-primary">Ghế đã đặt:</span> {gheDaDat}</p>
            </div>

            <div className="p-2 w-1/2">
              <h4 className="text-center mb-2 text-primary font-medium text-xl">
                Thông tin thanh toán
              </h4>
              <p><span className="text-primary">Mã thanh toán:</span> {thanhToan.maThanhToan || "N/A"}</p>
              <p><span className="text-primary">Tổng tiền:</span> {Number(bookings.tongTien).toLocaleString()} VND</p>
              <p><span className="text-primary">Phương thức:</span> {thanhToan.phuongThuc || "N/A"}</p>
              <p><span className="text-primary">Ngày thanh toán:</span> {thanhToan.ngayThanhToan ? new Date(thanhToan.ngayThanhToan).toLocaleString() : "N/A"}</p>
              <p>
                <span className="text-primary">Trạng thái:</span>
                <b className={isSuccess ? "text-green-500" : "text-red-500"}>
                  {thanhToan.trangThai || bookings.trangThai}
                </b>
              </p>
            </div>
          </div>
        </div>

        {/* Nút bấm */}
        <div className="flex justify-end mt-4 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer"
          >
            Đóng
          </button>

          {/* 📌 Nút In Vé PDF */}
          <button
            onClick={generateTicketPDF}
            className="px-4 py-2 bg-primary rounded cursor-pointer"
          >
            In vé
          </button>
        </div>

      </div>
    </div>
  );
};

export default ChiTietDonDatVe;
