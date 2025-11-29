import React from "react";
import { formatDate } from "../../lib/dateFormat";

const PhimDetail = ({ phim, onClose }) => {
  if (!phim) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-black/90 border border-primary p-6 rounded-xl w-[750px] text-white max-h-[90vh] overflow-y-auto no-scrollbar">

        <h2 className="text-2xl font-semibold mb-4 text-center bg-gradient-to-r from-primary to-yellow-200 bg-clip-text text-transparent">
          Chi tiết phim
        </h2>

        <div className="flex gap-6">
          <img
            src={phim.poster}
            alt={phim.tenPhim}
            className="w-50 h-66 object-contain rounded"
          />

          <div className="flex-1 space-y-2">
            <p><span className="text-primary">Tên phim:</span> {phim.tenPhim}</p>
            <p><span className="text-primary">Thời lượng:</span> {phim.thoiLuong} phút</p>
            <p><span className="text-primary">Ngày công chiếu:</span> {formatDate(phim.ngayCongChieu)}</p>
            <p><span className="text-primary">Đạo diễn:</span> {phim.daoDien?.tenDaoDien}</p>
            <p><span className="text-primary">Thể loại:</span> {phim.theLoais?.map(t => t.tenTheLoai).join(", ")}</p>
            <p><span className="text-primary">Diễn viên:</span> {phim.dienViens?.map(v => v.tenDienVien).join(", ")}</p>
            <p><span className="text-primary">Trạng thái:</span> {phim.trangThaiChieu}</p>
            <p><span className="text-primary">Độ tuổi:</span> {phim.phanLoai}</p>
            <p><span className="text-primary">Ngôn ngữ:</span> {phim.ngonNgu}</p>
            <p><span className="text-primary">Phụ đề:</span> {phim.phuDe}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="font-semibold mb-1 text-primary">Nội dung phim:</p>
          <p className="bg-[#111] p-3 rounded border border-gray-800 whitespace-pre-wrap">
            {phim.noiDung}
          </p>
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

export default PhimDetail;
