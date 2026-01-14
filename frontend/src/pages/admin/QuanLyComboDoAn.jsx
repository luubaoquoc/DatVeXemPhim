import React, { useEffect, useState } from "react";
import { PlusIcon, PencilIcon } from "lucide-react";
import useApi from "../../hooks/useApi";
import toast from "react-hot-toast";
import Pagination from "../../components/admin/Paginnation";
import DeleteForm from "../../components/admin/DeleteForm";
import SearchInput from "../../components/SearchInput";
import { useSearchParams } from "react-router-dom";

const ComboDoAn = () => {
  const api = useApi(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [combos, setCombos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [formData, setFormData] = useState({
    tenCombo: "",
    moTa: "",
    gia: "",
    hinhAnh: null,
    trangThai: "Hoạt động",
  });

  const [search, setSearch] = useState("");
  const currentPage = Number(searchParams.get("page")) || 1;
  const setCurrentPage = (page) => {
  setSearchParams({
    page,
    search,
  });
}
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Tất cả");

  /* ================= FETCH ================= */
  const fetchData = async () => {
    try {
      const res = await api.get("/combodoan", {
        params: { page: currentPage, limit, search, trangThai: filterStatus },
      });
      setCombos(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Lỗi tải danh sách combo!");
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, search, filterStatus]);

  /* ================= FORM ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("tenCombo", formData.tenCombo);
      data.append("moTa", formData.moTa);
      data.append("gia", formData.gia);
      data.append("trangThai", formData.trangThai);

      if (formData.hinhAnh instanceof File) {
        data.append("hinhAnh", formData.hinhAnh);
      }

      if (editItem) {
        await api.put(`/combodoan/${editItem.maCombo}`, data);
        toast.success("Cập nhật combo thành công!");
      } else {
        await api.post("/combodoan", data);
        toast.success("Thêm combo thành công!");
      }

      setShowModal(false);
      setEditItem(null);
      setFormData({
        tenCombo: "",
        moTa: "",
        gia: "",
        hinhAnh: null,
        trangThai: "Hoạt động",
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi thao tác!");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    try {
      await api.delete(`/combodoan/${id}`);
      toast.success("Xóa combo thành công!");
      fetchData();
    } catch {
      toast.error("Lỗi xóa combo!");
    }
  };

  /* ================= MODAL ================= */
  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({
        tenCombo: item.tenCombo || "",
        moTa: item.moTa || "",
        gia: item.gia || "",
        hinhAnh: item.hinhAnh || null,
        trangThai: item.trangThai || "Hoạt động",
      });
    } else {
      setEditItem(null);
      setFormData({
        tenCombo: "",
        moTa: "",
        gia: "",
        hinhAnh: null,
        trangThai: "Hoạt động",
      });
    }
    setShowModal(true);
  };

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Quản lý Combo đồ ăn</h1>

        <button
          onClick={() => openModal()}
          className="bg-primary px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80 cursor-pointer"
        >
          <PlusIcon size={18} /> Thêm combo
        </button>
      </div>

      <div className='flex flex-wrap gap-3 mb-4'>

        <SearchInput
          item="tên combo"
          search={search}
          onSearch={(value) => {
            setSearch(value);
            setSearchParams({
              page: 1,
              search: value,
            });
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-primary/70 px-3 py-2 bg-black h-[3rem] outline-none cursor-pointer"
        >
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="Hoạt động">Hoạt động</option>
          <option value="Ngừng hoạt động">Ngừng hoạt động</option>
        </select>
      </div>

      {/* TABLE */}
      <table className="w-full border-b border-primary/30 rounded-lg text-sm">
        <thead className="bg-primary/70">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2 text-left">Hình ảnh</th>
            <th className="p-2 text-left">Tên combo</th>
            <th className="p-2 text-left">Giá</th>
            <th className="p-2 text-left">Trạng thái</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {combos.map((item, index) => (
            <tr key={item.maCombo} className="border-b border-primary/30">
              <td className="p-2 text-center">
                {(currentPage - 1) * limit + index + 1}
              </td>

              <td className="p-2">
                {item.hinhAnh ? (
                  <img
                    src={item.hinhAnh}
                    className="h-12 w-12 object-cover rounded"
                  />
                ) : (
                  "Chưa có ảnh"
                )}
              </td>

              <td className="p-2">{item.tenCombo}</td>
              <td className="p-2">
                {item.gia.toLocaleString("vi-VN")} đ
              </td>
              <td className="p-2">
                {item.trangThai === "Hoạt động" ? (
                  <span className="px-2 py-1 bg-green-600/30 text-green-400 rounded-full">Hoạt động</span>
                ) : (
                  <span className="px-2 py-1 bg-red-600/30 text-red-400 rounded-full">Ngừng hoạt động</span>
                )}
              </td>

              <td className="p-2 text-center">
                <button
                  onClick={() => openModal(item)}
                  className="p-2 text-gray-400 hover:bg-primary/20 rounded cursor-pointer"
                >
                  <PencilIcon size={18} />
                </button>

                <DeleteForm
                  title="Combo"
                  itemName={item.tenCombo}
                  onDelete={() => handleDelete(item.maCombo)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="bg-black border border-primary p-6 rounded-lg w-96">
            <h2 className="text-2xl font-semibold mb-4 text-primary text-center">
              {editItem ? "Sửa combo" : "Thêm combo"}
            </h2>

            <form onSubmit={handleSubmit}>
              <input
                name="tenCombo"
                placeholder="Tên combo"
                className="w-full p-2 mb-3 bg-[#111] border border-gray-600 rounded"
                value={formData.tenCombo}
                onChange={handleChange}
                required
              />

              <textarea
                name="moTa"
                placeholder="Mô tả"
                className="w-full p-2 mb-3 bg-[#111] border border-gray-600 rounded"
                value={formData.moTa}
                onChange={handleChange}
              />

              <input
                type="number"
                name="gia"
                placeholder="Giá"
                className="w-full p-2 mb-3 bg-[#111] border border-gray-600 rounded"
                value={formData.gia}
                onChange={handleChange}
                required
              />

              <select
                name="trangThai"
                className="w-full p-2 mb-3 bg-[#111] border border-gray-600 rounded"
                value={formData.trangThai}
                onChange={handleChange}
              >
                <option value="Hoạt động">Hoạt động</option>
                <option value="Ngừng hoạt động">Ngừng hoạt động</option>
              </select>

              <div>
                <label className='block mb-1 font-medium text-primary'> Hình ảnh </label>
                <input
                  type="file"
                  accept="image/*"
                  name="hinhAnh"
                  className="w-full p-2 mb-4 bg-[#111] border border-gray-600 rounded"
                  onChange={handleChange}
                />
                {formData.hinhAnh && (
                  <img
                    src={
                      formData.hinhAnh instanceof File
                        ? URL.createObjectURL(formData.hinhAnh)
                        : formData.hinhAnh
                    }
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary-dull hover:bg-primary rounded cursor-pointer"
                >
                  {loading ? "Đang xử lý..." : editItem ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboDoAn;
