import React, { useEffect, useState } from "react"
import { PlusIcon, PencilIcon } from "lucide-react"
import useApi from "../../hooks/useApi"
import toast from "react-hot-toast"
import Pagination from "../../components/admin/Paginnation"
import DeleteForm from "../../components/admin/DeleteForm"
import SearchInput from "../../components/SearchInput"
import { formatDate } from "../../lib/dateFormat"

const QuanLyKhuyenMai = () => {
  const api = useApi(true)

  const [items, setItems] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    maKhuyenMai: "",
    loaiGiamGia: "PHAN_TRAM",
    giaTriGiamGia: "",
    giamToiDa: "",
    giaTriDonToiThieu: "",
    soLuotSuDung: "",
    ngayBatDau: "",
    ngayHetHan: "",
    trangThai: true
  })

  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10
  const [filterStatus, setFilterStatus] = useState("")

  // ================= FETCH LIST =================
  const fetchData = async () => {
    try {
      const res = await api.get("/khuyenmai", {
        params: { page: currentPage, limit, search, trangThai: filterStatus }
      })
      setItems(res.data.data)
      setTotalPages(res.data.totalPages)
    } catch {
      toast.error("Lỗi tải danh sách khuyến mãi")
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, search, filterStatus])

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editItem) {
        await api.put(`/khuyenmai/${editItem.id}`, formData)
        toast.success("Cập nhật khuyến mãi thành công")
      } else {
        await api.post("/khuyenmai", formData)
        toast.success("Thêm khuyến mãi thành công")
      }

      setShowModal(false)
      setEditItem(null)
      resetForm()
      fetchData()

    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi thao tác")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      maKhuyenMai: "",
      loaiGiamGia: "PHAN_TRAM",
      giaTriGiamGia: "",
      giamToiDa: "",
      giaTriDonToiThieu: "",
      soLuotSuDung: "",
      ngayBatDau: "",
      ngayHetHan: "",
      trangThai: true
    })
  }

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await api.delete(`/khuyenmai/${id}`)
      toast.success("Xoá thành công")
      fetchData()
    } catch {
      toast.error("Lỗi xoá khuyến mãi")
    }
  }

  // ================= OPEN MODAL =================
  const openModal = (item = null) => {
    if (item) {
      setEditItem(item)
      setFormData({
        maKhuyenMai: item.maKhuyenMai,
        loaiGiamGia: item.loaiGiamGia,
        giaTriGiamGia: item.giaTriGiamGia,
        giamToiDa: item.giamToiDa || "",
        giaTriDonToiThieu: item.giaTriDonToiThieu,
        soLuotSuDung: item.soLuotSuDung,
        ngayBatDau: item.ngayBatDau?.slice(0, 10),
        ngayHetHan: item.ngayHetHan?.slice(0, 10),
        trangThai: item.trangThai
      })
    } else {
      setEditItem(null)
      resetForm()
    }
    setShowModal(true)
  }

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Quản lý Khuyến Mãi</h1>

        <button
          onClick={() => openModal()}
          className="bg-primary px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80"
        >
          <PlusIcon size={18} /> Thêm khuyến mãi
        </button>
      </div>
      <div className='flex flex-wrap gap-3 mb-4'>
        <SearchInput
          search={search}
          setSearch={setSearch}
          setCurrentPage={setCurrentPage}
          item="mã khuyến mãi"
        />
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          className="border border-primary/70 px-3 py-2 bg-black h-[3rem] outline-none cursor-pointer"

        >
          <option value="">Tất cả</option>
          <option value="chua_bat_dau">Chưa bắt đầu</option>
          <option value="dang_ap_dung">Đang áp dụng</option>
          <option value="het_han">Đã hết hạn</option>
        </select>
      </div>

      {/* TABLE */}
      <table className="w-full text-sm border-b border-primary/30">
        <thead className="bg-primary/70">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2 text-left">Mã</th>
            <th className="p-2">Loại</th>
            <th className="p-2">Giảm</th>
            <th className="p-2">Số lượt</th>
            <th className="p-2">Ngày bắt đầu</th>
            <th className="p-2">Ngày hết hạn</th>
            <th className="p-2">Trạng thái</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={item.id} className="border-b border-primary/30">
              <td className="p-2 text-center">{(currentPage - 1) * limit + index + 1}</td>
              <td className="p-2">{item.maKhuyenMai}</td>
              <td className="p-2 text-center">{item.loaiGiamGia}</td>
              <td className="p-2 text-center">
                {item.loaiGiamGia === "PHAN_TRAM"
                  ? `${item.giaTriGiamGia}%`
                  : item.giaTriGiamGia.toLocaleString()}
              </td>
              <td className="p-2 text-center">{item.soLuotSuDung}</td>
              <td className="p-2 text-center">{formatDate(item.ngayBatDau)}</td>
              <td className="p-2 text-center">{formatDate(item.ngayHetHan)}</td>
              <td className="p-2 text-center">
                {item.trangThai === true ? (
                  <span className="px-2 py-1 bg-green-600/30 text-green-400 rounded-full">Hoạt động</span>
                ) : (
                  <span className="px-2 py-1 bg-red-600/30 text-red-400 rounded-full">Tắt</span>
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
                  title="Khuyến mãi"
                  itemName={item.maKhuyenMai}
                  onDelete={() => handleDelete(item.id)}
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
          <div className="bg-black/80 border border-primary p-6 rounded w-160 max-h-[600px] max-md:m-4">
            <h2 className="text-2xl font-semibold mb-4 text-primary text-center">
              {editItem ? "Sửa khuyến mãi" : "Thêm khuyến mãi"}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 font-medium text-primary">Mã Khuyến Mãi</label>
                <input
                  name="maKhuyenMai"
                  value={formData.maKhuyenMai}
                  onChange={handleChange}
                  placeholder="Mã khuyến mãi"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-primary">Loại Giảm Giá</label>
                <select
                  name="loaiGiamGia"
                  value={formData.loaiGiamGia}
                  onChange={handleChange}
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600">
                  <option value="PHAN_TRAM">Phần trăm</option>
                  <option value="TIEN_MAT">Tiền mặt</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium text-primary">Giá Trị Giảm</label>
                <input
                  name="giaTriGiamGia"
                  type="number"
                  value={formData.giaTriGiamGia}
                  onChange={handleChange}
                  placeholder="Giá trị giảm"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600" />
              </div>

              {formData.loaiGiamGia === "PHAN_TRAM" && (
                <div>
                  <label className="block mb-1 font-medium text-primary">Giảm Tối Đa (Áp dụng với Phần trăm)</label>
                  <input
                    name="giamToiDa"
                    type="number"
                    value={formData.giamToiDa}
                    onChange={handleChange}
                    placeholder="Giảm tối đa"
                    className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600"
                  />
                </div>
              )}

              <div>
                <label className="block mb-1 font-medium text-primary">Giá Trị Đơn Tối Thiểu</label>
                <input
                  name="giaTriDonToiThieu"
                  type="number"
                  value={formData.giaTriDonToiThieu}
                  onChange={handleChange}
                  placeholder="Đơn tối thiểu"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-primary">Số Lượt Sử Dụng</label>
                <input
                  name="soLuotSuDung"
                  type="number"
                  value={formData.soLuotSuDung}
                  onChange={handleChange}
                  placeholder="Số lượt"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600" />
              </div>

              <div>
                <label className="block mb-1 font-medium text-primary">Ngày Bắt Đầu</label>
                <input
                  name="ngayBatDau"
                  type="date"
                  value={formData.ngayBatDau}
                  onChange={handleChange}
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600" />
              </div>

              <div>
                <label className="block mb-1 font-medium text-primary">Ngày Hết Hạn</label>
                <input
                  name="ngayHetHan"
                  type="date"
                  value={formData.ngayHetHan}
                  onChange={handleChange}
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600" />
              </div>

              <label className="flex items-center gap-2">
                <input type="checkbox" name="trangThai" checked={formData.trangThai} onChange={handleChange} />
                Hoạt động
              </label>

              <div className="flex justify-end gap-2 mt-3 col-span-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-600 rounded cursor-pointer hover:bg-gray-500">Huỷ</button>
                <button disabled={loading} className="px-4 py-2 bg-primary-dull rounded cursor-pointer hover:bg-primary text-white">
                  {loading ? "Đang xử lý..." : editItem ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuanLyKhuyenMai
