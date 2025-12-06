import React, { useEffect, useState } from "react"
import { PlusIcon, PencilIcon, Trash2Icon, SearchIcon } from "lucide-react"
import useApi from "../../hooks/useApi"
import toast from "react-hot-toast"
import { formatDate } from "../../lib/dateFormat"
import Pagination from "../../components/admin/Paginnation"
import DeleteForm from "../../components/admin/DeleteForm"
import SearchInput from "../../components/SearchInput"

const DienVien = () => {
  const api = useApi(true)
  const [dienViens, setDienViens] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({
    tenDienVien: "",
    anhDaiDien: null,
    ngaySinh: "",
    tieuSu: ""
  })
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [loading, setLoading] = useState(false);





  // Gọi API lấy danh sách đạo diễn
  const fetchData = async () => {
    try {
      const res = await api.get("/dienvien", {
        params: { page: currentPage, limit, search }
      });
      setDienViens(res.data.data)
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Lỗi tải danh sách diễn viên!")
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, search])

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      return setFormData(prev => ({ ...prev, [name]: files[0] }))
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Gửi form thêm/sửa
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true);
    try {

      const data = new FormData();
      data.append("tenDienVien", formData.tenDienVien);
      data.append("ngaySinh", formData.ngaySinh);
      data.append("tieuSu", formData.tieuSu);
      if (formData.anhDaiDien instanceof File) {
        data.append("anhDaiDien", formData.anhDaiDien);
      }
      if (editItem) {
        await api.put(`/dienvien/${editItem.maDienVien}`, data, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        toast.success("Cập nhật thành công!")
      } else {
        await api.post("/dienvien", data, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        toast.success("Thêm mới thành công!")
      }

      setShowModal(false)
      setEditItem(null)
      setFormData({ tenDienVien: "", anhDaiDien: null, ngaySinh: "", tieuSu: "" })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi thao tác!")
    } finally {
      setLoading(false)
    }
  }

  // Xóa diễn viên
  const handleDelete = async (maDienVien) => {
    try {
      await api.delete(`/dienvien/${maDienVien}`)
      toast.success("Xoá diễn viên thành công!")
      fetchData()
    } catch (err) {
      console.log(err);
      toast.error("Xoá thất bại!")
    }
  }

  // Mở modal thêm/sửa
  const openModal = (item = null) => {
    if (item) {
      setEditItem(item)
      setFormData({
        tenDienVien: item.tenDienVien || "",
        anhDaiDien: item.anhDaiDien || null,
        ngaySinh: item.ngaySinh ? new Date(item.ngaySinh).toISOString().split("T")[0] : "",
        tieuSu: item.tieuSu || ""
      })
    } else {
      setEditItem(null)
      setFormData({ tenDienVien: "", anhDaiDien: null, ngaySinh: "", tieuSu: "" })
    }
    setShowModal(true)
  }
  console.log(editItem);



  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Quản lý Diễn viên</h1>
        <button
          onClick={() => openModal()}
          className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80 transition cursor-pointer"
        >
          <PlusIcon size={18} /> Thêm diễn viên
        </button>
      </div>

      <SearchInput
        search={search}
        setSearch={setSearch}
        setCurrentPage={setCurrentPage}
        item="tên diễn viên"
      />

      <table className="w-full border-b border-primary/30 rounded-lg text-sm">
        <thead className="bg-primary/70 text-white">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2 text-left">Tên diễn viên</th>
            <th className="p-2 text-left">Ảnh đại diện</th>
            <th className="p-2 text-left">Ngày sinh</th>
            <th className="p-2 text-left">Tiểu sử</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {dienViens.map((item, index) => (
            <tr key={item.maDienVien} className=" text-center border-b border-primary/30">
              <td className="p-2">{(currentPage - 1) * limit + index + 1}</td>
              <td className="p-2 text-left">
                {item.anhDaiDien ? (
                  <img src={item.anhDaiDien} alt={item.tenDienVien} className="h-12 w-12 object-cover rounded" />
                ) : (
                  "Chưa cập nhật"
                )}
              </td>
              <td className="p-2 text-left">{item.tenDienVien}</td>
              <td className="p-2 text-left">{formatDate(item.ngaySinh) || "Chưa cập nhật"}</td>
              <td className="p-2 text-left max-w-[250px] truncate">{item.tieuSu || "Chưa cập nhật"}</td>
              <td className="p-2">
                <button
                  onClick={() => openModal(item)}
                  className="p-2 text-gray-400 hover:bg-primary/20 rounded cursor-pointer"
                >
                  <PencilIcon size={18} />
                </button>
                <DeleteForm
                  title="Diễn viên"
                  itemName={item.tenDienVien}
                  onDelete={() => handleDelete(item.maDienVien)}
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



      {/* Modal thêm/sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-black/80 border border-primary p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              {editItem ? 'Sửa diễn viên' : 'Thêm diễn viên'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label className='block mb-1'>Tên Diễn Viên</label>
                <input
                  type="text"
                  name="tenDienVien"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                  placeholder="Tên diễn viên..."
                  value={formData.tenDienVien}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className='block mb-1'>Ảnh đại diện</label>
                <div className="flex gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    name="anhDaiDien"
                    className="w-full h-[3rem] p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                    onChange={handleChange}
                  />
                  {
                    formData.anhDaiDien && (
                      <img
                        src={
                          formData.anhDaiDien instanceof File
                            ? URL.createObjectURL(formData.anhDaiDien)
                            : formData.anhDaiDien
                        }
                        alt="Preview"
                        className="h-20 w-20 object-cover mb-4 rounded"
                      />
                    )
                  }
                </div>
              </div>

              <div>
                <label className='block mb-1'>Ngày sinh</label>
                <input
                  type="date"
                  name="ngaySinh"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                  value={formData.ngaySinh || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className='block mb-1'>Tiểu sử</label>
                <textarea
                  name="tieuSu"
                  rows="3"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                  placeholder="Tiểu sử diễn viên..."
                  value={formData.tieuSu}
                  onChange={handleChange}
                ></textarea>
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
                  className={`px-4 py-2 rounded cursor-pointer flex items-center gap-2 hover:bg-primary/80 text-white
                  ${loading ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary'}
                `}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    editItem ? 'Cập nhật' : 'Thêm'
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

export default DienVien
