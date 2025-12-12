import React, { useEffect, useState } from "react";
import { PencilIcon } from "lucide-react";
import toast from "react-hot-toast";
import useApi from "../../hooks/useApi";
import Pagination from "../../components/admin/Paginnation";
import DeleteForm from "../../components/admin/DeleteForm";
import SearchInput from "../../components/SearchInput";

const QuanLyDanhGia = () => {
  const api = useApi(true);

  const [danhGias, setDanhGias] = useState([]);

  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedDanhGia, setSelectedDanhGia] = useState(null);
  const [diem, setDiem] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Fetch API
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/danhgia", {
        params: { page: currentPage, limit, search }
      });
      setDanhGias(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Không thể tải danh sách đánh giá!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, search]);

  // Mở modal sửa điểm
  const openEdit = (item) => {
    setSelectedDanhGia(item);
    setDiem(item.diem);
    setShowModal(true);
  };

  // Submit cập nhật
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/danhgia/${selectedDanhGia.maDanhGia}`, { diem });
      toast.success("Cập nhật đánh giá thành công!");
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại!");
    }
  };

  // Xoá đánh giá
  const handleDelete = async (maDanhGia) => {
    try {
      await api.delete(`/danhgia/${maDanhGia}`);
      toast.success("Xoá thành công!");
      fetchData();
    } catch {
      toast.error("Không thể xoá!");
    }
  };


  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-semibold mb-6">Quản lý đánh giá</h1>

      <SearchInput
        search={search}
        setSearch={setSearch}
        setCurrentPage={setCurrentPage}
        item="tên phim"
      />

      <table className="w-full border-b border-primary/30 rounded-lg text-sm mt-4">
        <thead className="bg-primary/70 text-white">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2 text-left">Người đánh giá</th>
            <th className="p-2 text-left">Phim</th>
            <th className="p-2 text-left">Điểm</th>
            <th className="p-2 text-left">Ngày đánh giá</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>

        {danhGias.length === 0 && !loading && (
          <tbody>
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-400">
                Không tìm thấy đánh giá nào.
              </td>
            </tr>
          </tbody>
        )}
        <tbody>
          {danhGias.map((d, index) => (
            <tr key={d.maDanhGia} className="border-b border-primary/30">
              <td className="p-2 text-center">{index + 1}</td>
              <td className="p-2">{d.taiKhoan.hoTen}</td>
              <td className="p-2">{d.phim.tenPhim}</td>
              <td className="p-2">{d.diem}</td>
              <td className="p-2">{new Date(d.ngayDanhGia).toLocaleDateString()}</td>

              <td className="p-2 text-center flex justify-center">
                <button
                  onClick={() => openEdit(d)}
                  className="p-2 text-gray-400 hover:bg-primary/20 rounded cursor-pointer transition"
                >
                  <PencilIcon size={18} />
                </button>

                <DeleteForm
                  title="Đánh giá"
                  itemName={d.phim.tenPhim}
                  onDelete={() => handleDelete(d.maDanhGia)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* MODAL UPDATE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="bg-black/80 border border-primary p-6 rounded-lg w-80">
            <h2 className="text-2xl font-semibold mb-4 text-primary text-center">Sửa điểm đánh giá</h2>

            <form onSubmit={handleUpdate}>
              <label className="block mb-1 font-medium text-primary">Điểm (0 – 10)</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={diem}
                onChange={(e) => setDiem(e.target.value)}
                className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600"
                required
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  type="button"
                  className="px-4 py-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-white cursor-pointer hover:bg-primary/80 
                  ${loading ? "bg-primary/50 cursor-not-allowed" : "bg-primary hover:bg-primary/80"}`}>
                  {loading ? "Đang xử lý..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuanLyDanhGia;
