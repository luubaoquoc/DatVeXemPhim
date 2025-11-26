import React, { useEffect, useState } from "react"
import { PlusIcon, PencilIcon, Trash2Icon, SearchIcon } from "lucide-react"
import toast from "react-hot-toast"
import useApi from "../../hooks/useApi"
import Pagination from "../../components/admin/Paginnation"
import DeleteForm from "../../components/admin/DeleteForm"
import SearchInput from "../../components/SearchInput"

const PhongChieu = () => {
  const api = useApi(true)

  const [phongchieus, setPhongChieus] = useState([])
  const [raps, setRaps] = useState([]);
  const [showModal, setShowModal] = useState(false)
  const [editPhong, setEditPhong] = useState(null)
  const [formData, setFormData] = useState({
    tenPhong: "",
    tongSoGhe: "",
    maRap: "",
  })
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10
  const [loading, setLoading] = useState(false);


  // Fetch API
  const fetchData = async () => {
    try {
      const res = await api.get("/phongchieu", {
        params: { page: currentPage, limit, search }
      })
      setPhongChieus(res.data.items)
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
  }, [currentPage, search])

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
        await api.put(`/phongchieu/${editPhong.maPhong}`, formData)
        toast.success("Cập nhật phòng chiếu thành công!")
      } else {
        await api.post("/phongchieu", formData)
        toast.success("Thêm phòng chiếu thành công!")
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
      await api.delete(`/phongchieu/${maPhong}`)
      toast.success("Xoá thành công!")
      fetchData()
    } catch (err) {
      console.log(err);
      toast.error("Xóa thất bại!")
    }
  }


  // Mở modal thêm/sửa
  const openModal = (item = null) => {
    if (item) {
      setEditPhong(item)
      setFormData({
        tenPhong: item.tenPhong || "",
        tongSoGhe: item.tongSoGhe || "",
        maRap: item.maRap || ""
      })
    } else {
      setEditPhong(null)
      setFormData({ tenPhong: "", tongSoGhe: "", maRap: "" })
    }
    setShowModal(true)
  }

  console.log(phongchieus);


  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Quản lý phòng chiếu</h1>

        <button
          onClick={() => { openModal() }}
          className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80 transition cursor-pointer"
        >
          <PlusIcon size={18} /> Thêm phòng
        </button>
      </div>

      {/* Search */}
      <SearchInput
        search={search}
        setSearch={setSearch}
        setCurrentPage={setCurrentPage}
      />

      {/* Table */}

      <table className="w-full border-b border-primary/30 rounded-lg text-sm">
        <thead className="bg-primary/70 text-white">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2 text-left">Tên phòng</th>
            <th className="p-2 text-left">Tổng ghế</th>
            <th className="p-2 text-left">Tên rạp</th>
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

              <td className="p-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    openModal(phong)
                  }}
                  className="p-2 text-blue-400 hover:bg-primary/20 rounded cursor-pointer"
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
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-black/80 border border-primary p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              {editPhong ? 'Sửa phòng chiếu' : 'Thêm phòng chiếu'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label className='block mb-1'>Tên Phòng</label>
                <input
                  type="text"
                  name="tenPhong"
                  className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 text-white"
                  placeholder="Tên phòng..."
                  value={formData.tenPhong}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className='block mb-1'>Tổng ghế</label>
                <input
                  type="number"
                  name="tongSoGhe"
                  className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 text-white"
                  value={formData.tongSoGhe || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block mb-1">Chọn rạp</label>
                <select
                  name="maRap"
                  className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 text-white cursor-pointer"
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


              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 rounded cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded cursor-pointer flex items-center gap-2
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
