import React, { useEffect, useState } from "react";
import useApi from "../../hooks/useApi";
import { Eye, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import SearchInput from "../../components/SearchInput";
import Pagination from "../../components/admin/Paginnation";
import DeleteForm from "../../components/admin/DeleteForm";
import ChiTietDonDatVe from "../../components/admin/ChiTietDonDatVe";

const QuanLyDonDatVe = () => {
  const api = useApi(true);

  const [donDatVe, setDonDatVe] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("tất cả")

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const [showDetail, setShowDetail] = useState(false)
  const [detailDonDatVe, setDetailDonDatVe] = useState(null);


  console.log(donDatVe);


  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/datve", {
        params: {
          page: currentPage,
          limit,
          search,
          status:
            filterStatus === "tất cả"
              ? ""
              : filterStatus === "Thành công"
                ? "success"
                : "failed",
        },
      });

      setDonDatVe(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải danh sách đơn đặt vé");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, search, filterStatus]);



  // Xóa đơn đặt vé
  const handleDelete = async (maDatVe) => {
    try {
      await api.delete(`/datve/${maDatVe}`)
      toast.success("Xoá đơn đặt vé thành công!")
      fetchOrders()
    } catch (err) {
      console.log(err);
      toast.error("Xoá thất bại!")
    }
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Quản Lý Đơn Đặt Vé</h1>

      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-3 mb-4">

        {/* Search */}
        <SearchInput
          search={search}
          setSearch={setSearch}
          setCurrentPage={setCurrentPage}
          item="mã vé "
        />

        {/* Trạng thái */}
        <select
          className="border border-primary/70 px-3 py-2 bg-black h-[3rem] outline-none"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="tất cả">Tất cả trạng thái</option>
          <option value="Thành công">Thành công</option>
          <option value="Thất bại">Thất bại</option>
        </select>


      </div>

      {/* Bảng dữ liệu */}
      <table className="w-full border-b border-primary/30 rounded-lg text-sm">
        <thead className="bg-primary/70 text-white">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2">Mã Vé</th>
            <th className="p-2">Người Đặt</th>
            <th className="p-2">Nhân Viên bán</th>
            <th className="p-2">Phim</th>
            <th className="p-2">Ngày chiếu</th>
            <th className="p-2">Suất Chiếu</th>
            <th className="p-2">Ghế</th>
            <th className="p-2">Tổng</th>
            <th className="p-2">Trạng Thái</th>
            <th className="p-2 text-center">Hành Động</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="8" className="text-center py-10">
                Đang tải...
              </td>
            </tr>
          ) : donDatVe.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-10">
                Không có đơn đặt vé nào.
              </td>
            </tr>
          ) : (
            donDatVe.map((order) => (
              <tr
                key={order.maDatVe}
                className="text-center border-b border-primary/30"
              >
                <td className="p-2">{(currentPage - 1) * limit + donDatVe.indexOf(order) + 1}</td>
                <td className="p-2">{order.maDatVe}</td>
                <td className="p-2">{order.khachHang?.hoTen}</td>
                <td className="p-2">{order.nhanVien?.hoTen || "-"}</td>
                <td className="p-2">{order.suatChieu?.phim?.tenPhim}</td>
                <td>{order.suatChieu?.gioBatDau?.slice(0, 10)}</td>
                <td className="p-2">
                  {order.suatChieu?.gioBatDau?.slice(11, 16)} –{" "}
                  {order.suatChieu?.gioKetThuc?.slice(11, 16)}
                </td>

                <td className="p-2">{order.tongSoGhe} ghế</td>

                <td className="p-2 font-semibold">
                  {order.tongTien.toLocaleString()} VND
                </td>

                <td className="p-2">{order.trangThai}</td>

                <td className="p-2 flex items-center justify-center">
                  <button onClick={() => {
                    setDetailDonDatVe(order);
                    setShowDetail(true);
                  }}
                    className=" text-blue-500 hover:bg-primary/20 rounded cursor-pointer p-2">
                    <Eye size={20} />
                  </button>

                  <DeleteForm
                    title="Đơn Đặt Vé"
                    itemName={order.maDatVe}
                    onDelete={() => handleDelete(order.maDatVe)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Phân trang */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {showDetail && (
        <ChiTietDonDatVe
          bookings={detailDonDatVe}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
};

export default QuanLyDonDatVe;
