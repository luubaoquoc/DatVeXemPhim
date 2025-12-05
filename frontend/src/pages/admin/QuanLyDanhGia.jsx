import React, { useEffect, useState } from "react"
import { PlusIcon, PencilIcon, Trash2Icon, SearchIcon } from "lucide-react"
import toast from "react-hot-toast"
import useApi from "../../hooks/useApi"
import Pagination from "../../components/admin/Paginnation"
import DeleteForm from "../../components/admin/DeleteForm"
import SearchInput from "../../components/SearchInput"
import Loading from "../../components/Loading"

const QuanLyDanhGia = () => {
  const api = useApi(true)

  const [danhGias, setDanhGias] = useState([]);
  const [showModal, setShowModal] = useState(false)
  const [editDanhGia, setEditDanhGia] = useState(null)
  const [formData, setFormData] = useState({
    tenRap: "",
    diaChi: "",
    soDienThoai: "",
  })
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10
  const [loading, setLoading] = useState(false)

  // Fetch API
  const fetchData = async () => {
    try {
      const res = await api.get("/danhgia", {
        params: { page: currentPage, limit, search }
      })
      setDanhGias(res.data.data)
      setTotalPages(res.data.totalPages)
    } catch {
      toast.error("Không thể tải danh sách đánh giá!")
    }
  }


  useEffect(() => {
    fetchData()
  }, [currentPage, search])

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editDanhGia) {
        await api.put(`/danhgia/${editDanhGia.maDanhGia}`, formData)
        toast.success("Cập nhật đánh giá thành công!")
      } else {
        await api.post("/rap", formData)
        toast.success("Thêm rạp thành công!")
      }

      setShowModal(false)
      setEditDanhGia(null)
      setFormData({
        tenRap: "",
        diaChi: "",
        soDienThoai: "",
      })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi thao tác!")
    } finally {
      setLoading(false)
    }
  }

  // Xóa phòng
  const handleDelete = async (maDanhGia) => {
    try {
      await api.delete(`/danhgia/${maDanhGia}`)
      toast.success("Xoá đánh giá thành công!")
      fetchData()
    } catch (err) {
      console.log(err);
      toast.error("Xoá thất bại!")
    }
  }


  // Mở modal thêm/sửa
  const openModal = (data = null) => {
    if (data) {
      setEditDanhGia(data)
      setFormData({
        tenRap: data.tenRap || "",
        diaChi: data.diaChi || "",
        soDienThoai: data.soDienThoai || ""
      })
    } else {
      setEditDanhGia(null)
      setFormData({ tenRap: "", diaChi: "", soDienThoai: "" })
    }
    setShowModal(true)
  }

  console.log(danhGias);
  if (loading) return <Loading />


  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Quản lý đánh giá</h1>

        <button
          onClick={() => { openModal() }}
          className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80 transition cursor-pointer"
        >
          <PlusIcon size={18} /> Thêm đánh giá
        </button>
      </div>

      {/* Search */}
      <SearchInput
        search={search}
        setSearch={setSearch}
        setCurrentPage={setCurrentPage}
        item="tên rạp"
      />

      {/* Table */}

      <table className="w-full border-b border-primary/30 rounded-lg text-sm">
        <thead className="bg-primary/70 text-white">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2 text-left">Tên tài khoản</th>
            <th className="p-2 text-left">tên phim</th>
            <th className="p-2 text-left">Điểm</th>
            <th className="p-2 text-left">Ngày đánh giá</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {danhGias?.map((danhGia, index) => (
            <tr key={danhGia.maDanhGia} className="text-center border-b border-primary/30">
              <td className="p-2">{index + 1}</td>
              <td className="p-2 font-medium text-left">{danhGia.taiKhoan.hoTen}</td>
              <td className="p-2 text-left">{danhGia.phim.tenPhim}</td>
              <td className="p-2 text-left">{danhGia.diem}</td>
              <td className="p-2 text-left">{danhGia.ngayDanhGia}</td>

              <td className="p-2 flex justify-center">
                <button
                  onClick={() => {
                    openModal(danhGia)
                  }}
                  className="p-2 text-gray-400 hover:bg-primary/20 rounded cursor-pointer"
                >
                  <PencilIcon size={18} />
                </button>

                <DeleteForm
                  title="Rạp"
                  itemName={danhGia.tenTaiKhoan}
                  onDelete={() => handleDelete(danhGia.maDanhGia)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-black/80 border border-primary p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              {editDanhGia ? 'Sửa đánh giá' : 'Thêm đánh giá'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label className='block mb-1'>Tên rạp</label>
                <input
                  type="text"
                  name="tenRap"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                  placeholder="Tên rạp..."
                  value={formData.tenRap}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className='block mb-1'>Địa chỉ</label>
                <input
                  type="text"
                  name="diaChi"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                  value={formData.diaChi || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block mb-1">Số điện thoại</label>
                <input
                  type="text"
                  name="soDienThoai"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                  value={formData.soDienThoai || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 rounded cursor-pointer hover:bg-gray-500 text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded cursor-pointer flex items-center gap-2 hover:bg-primary/80 text-white transition 
                  ${loading ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary'}
                `}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    editDanhGia ? 'Cập nhật' : 'Thêm'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuanLyDanhGia
