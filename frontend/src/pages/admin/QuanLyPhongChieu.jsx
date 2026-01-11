import React, { useEffect, useState } from "react"
import { PlusIcon, PencilIcon, Trash2Icon, SearchIcon } from "lucide-react"
import toast from "react-hot-toast"
import useApi from "../../hooks/useApi"
import Pagination from "../../components/admin/Paginnation"
import DeleteForm from "../../components/admin/DeleteForm"
import SearchInput from "../../components/SearchInput"
import { useSelector } from "react-redux"

const PhongChieu = () => {
  const api = useApi(true)

  const user = useSelector((state) => state.auth.user)

  const [phongchieus, setPhongChieus] = useState([])
  const [raps, setRaps] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editPhong, setEditPhong] = useState(null)
  const [formData, setFormData] = useState({
    tenPhong: "",
    tongSoGhe: "",
    maRap: "",
    trangThai: "Hoạt động"
  })
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState("")
  const [filterTrangThai, setFilterTrangThai] = useState("")


  // Fetch API
  const fetchData = async () => {
    try {
      const res = await api.get("/phongchieu", {
        params: { page: currentPage, limit, search, maRap: filterStatus, trangThai: filterTrangThai }
      })
      setPhongChieus(res.data.data)
      setTotalPages(res.data.totalPages)
    } catch {
      toast.error("Không thể tải danh sách phòng!")
    }
  }
  const fetchRaps = async () => {
    try {
      const res = await api.get("/rap");
      setRaps(res.data.data || res.data); // tùy API trả ra
    } catch {
      toast.error("Không thể tải danh sách rạp!");
    }
  };

  useEffect(() => {
    fetchData()
    fetchRaps()
  }, [currentPage, search, filterStatus, filterTrangThai])

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true);
    try {
      if (editPhong) {
        const res = await api.put(`/phongchieu/${editPhong.maPhong}`, formData)
        toast.success(res.data.message || "Cập nhật phòng chiếu thành công!")
      } else {
        const res = await api.post("/phongchieu", formData)
        toast.success(res.data.message || "Thêm phòng chiếu thành công!")
      }

      setShowModal(false)
      setEditPhong(null)
      setFormData({
        tenPhong: "",
        tongSoGhe: "",
        maRap: "",
      })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi thao tác!")
    } finally {
      setLoading(false)
    }
  }

  // Xóa phòng
  const handleDelete = async (maPhong) => {
    try {
      const res = await api.delete(`/phongchieu/${maPhong}`)
      toast.success(res.data.message || "Xoá thành công!")
      fetchData()
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Xóa thất bại!")
    }
  }


  // Mở modal thêm/sửa
  const openModal = (item = null) => {
    if (item) {
      setEditPhong(item)
      setFormData({
        tenPhong: item.tenPhong || "",
        tongSoGhe: item.tongSoGhe || "",
        maRap: item.maRap || "",
        trangThai: item.trangThai || "Hoạt động"
      })
    } else {
      setEditPhong(null)
      setFormData({ tenPhong: "", tongSoGhe: "", maRap: "", trangThai: "Hoạt động" })
    }
    setShowModal(true)
  }

  console.log(phongchieus);


  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold max-md:text-2xl">Quản lý phòng chiếu</h1>

        <button
          onClick={() => { openModal() }}
          className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80 transition cursor-pointer"
        >
          <PlusIcon size={18} /> <span className="max-md:hidden">Thêm phòng</span>
        </button>
      </div>

      <div className='flex flex-wrap gap-3 mb-4'>
        <SearchInput
          search={search}
          setSearch={setSearch}
          setCurrentPage={setCurrentPage}
          item="tên phòng"
        />

        {/*Lọc Rạp */}
        {user?.vaiTro === 4 && (
          <select
            className="border border-primary/70 px-3 py-2 bg-black h-[3rem] outline-none cursor-pointer"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tất cả rạp</option>
            {
              raps.map(rap => (
                <option key={rap.maRap} value={rap.maRap}>{rap.tenRap}</option>
              ))
            }
          </select>
        )}

        <select
          className="border border-primary/70 px-3 py-2 bg-black h-[3rem] outline-none cursor-pointer"
          value={filterTrangThai}
          onChange={(e) => {
            setFilterTrangThai(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Hoạt động">Hoạt động</option>
          <option value="Bảo trì">Bảo trì</option>
        </select>
      </div>
      {/* Table */}

      <table className="w-full border-b border-primary/30 rounded-lg text-sm">
        <thead className="bg-primary/70 text-white">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2 text-left">Tên phòng</th>
            <th className="p-2 text-left">Tổng ghế</th>
            <th className="p-2 text-left">Tên rạp</th>
            <th className="p-2 text-left">Trạng thái</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {phongchieus?.map((phong, index) => (
            <tr key={phong.maPhong} className="text-center border-b border-primary/30">
              <td className="p-2">{index + 1}</td>
              <td className="p-2 font-medium text-left">{phong.tenPhong}</td>
              <td className="p-2 text-left">{phong.tongSoGhe}</td>
              <td className="p-2 text-left">{phong.rap?.tenRap}</td>
              <td className="p-2 text-left">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${phong.trangThai === "Hoạt động"
                      ? "bg-green-500/20 text-green-400 border border-green-500/40"
                      : "bg-red-500/20 text-red-400 border border-red-500/40"}
                  `}
                >
                  {phong.trangThai}
                </span>
              </td>
              <td className="p-2 flex justify-center">
                <button
                  onClick={() => {
                    openModal(phong)
                  }}
                  className="p-2 text-gray-400 hover:bg-primary/20 rounded cursor-pointer"
                >
                  <PencilIcon size={18} />
                </button>

                <DeleteForm
                  title="Phòng chiếu"
                  itemName={phong.tenPhong}
                  onDelete={() => handleDelete(phong.maPhong)}
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
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="bg-black/80 border border-primary p-6 rounded-lg w-96 max-md:m-4">
            <h2 className="text-2xl font-semibold mb-4 text-primary text-center">
              {editPhong ? 'Sửa phòng chiếu' : 'Thêm phòng chiếu'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label className='block mb-1 font-medium text-primary'>Tên Phòng</label>
                <input
                  type="text"
                  name="tenPhong"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                  placeholder="Tên phòng..."
                  value={formData.tenPhong}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className='block mb-1 font-medium text-primary'>Tổng ghế</label>
                <input
                  type="number"
                  name="tongSoGhe"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                  value={formData.tongSoGhe || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-primary">Chọn rạp</label>
                <select
                  name="maRap"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white cursor-pointer"
                  value={formData.maRap}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn rạp --</option>
                  {raps.map((rap) => (
                    <option key={rap.maRap} value={rap.maRap}>
                      {rap.tenRap}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium text-primary">Trạng thái</label>
                <select
                  name="trangThai"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white cursor-pointer"
                  value={formData.trangThai}
                  onChange={handleChange}
                  required
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Bảo trì">Bảo trì</option>
                </select>
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
                    editPhong ? 'Cập nhật' : 'Thêm'
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

export default PhongChieu
