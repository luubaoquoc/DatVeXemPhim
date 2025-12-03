import React, { useEffect, useState } from 'react'
import { PlusIcon, PencilIcon, Trash2Icon, SearchIcon } from 'lucide-react'
import useApi from '../../hooks/useApi'
import toast from 'react-hot-toast'
import Pagination from '../../components/admin/Paginnation'
import DeleteForm from '../../components/admin/DeleteForm'
import SearchInput from '../../components/SearchInput'

const TheLoai = () => {
  const api = useApi(true)
  const [theloais, setTheloais] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({
    tenTheLoai: '',
    moTa: ''
  })
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const [loading, setLoading] = useState(false);


  // Gọi API lấy danh sách đạo diễn
  const fetchData = async () => {
    try {
      const res = await api.get("/theloai", {
        params: { page: currentPage, limit, search }
      });
      setTheloais(res.data.data)
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Lỗi tải danh sách thể loại!')
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

  // Gửi form thêm/sửa
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editItem) {
        await api.put(`/theloai/${editItem.maTheLoai}`, formData)
        toast.success('Cập nhật thành công!')
      } else {
        await api.post('/theloai', formData)
        toast.success('Thêm mới thành công!')
      }

      setShowModal(false)
      setEditItem(null)
      setFormData({ tenTheLoai: '', moTa: '' })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thao tác!')
    } finally {
      setLoading(false)
    }
  }

  // Xóa thể loại
  const handleDelete = async (maTheLoai) => {
    try {
      await api.delete(`/theloai/${maTheLoai}`)
      toast.success("Xoá thể loại thành công!")
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
        tenTheLoai: item.tenTheLoai,
        moTa: item.moTa
      })
    } else {
      setEditItem(null)
      setFormData({ tenTheLoai: '', moTa: '' })
    }
    setShowModal(true)
  }
  console.log(editItem);

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Quản lý Thể loại</h1>
        <button
          onClick={() => openModal()}
          className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80 transition cursor-pointer"
        >
          <PlusIcon size={18} /> Thêm thể loại
        </button>
      </div>

      <SearchInput
        search={search}
        setSearch={setSearch}
        setCurrentPage={setCurrentPage}
        item="tên thể loại"
      />
      <table className="w-full border-b border-primary/30 rounded-lg text-sm">
        <thead className="bg-primary/70 text-white">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2 text-left">Tên thể loại</th>
            <th className="p-2 text-left">Mô tả</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {theloais.map((item, index) => (
            <tr key={item.maTheLoai} className=" text-center border-b border-primary/30">
              <td className="p-2">{index + 1}</td>
              <td className="p-2 text-left">{item.tenTheLoai}</td>
              <td className="p-2 text-left">{item.moTa || 'Chưa cập nhật'}</td>
              <td className="p-2">
                <button
                  onClick={() => openModal(item)}
                  className="p-2 text-blue-400 hover:bg-primary/20 rounded cursor-pointer"
                >
                  <PencilIcon size={18} />
                </button>
                <DeleteForm
                  title="Thể loại"
                  itemName={item.tenTheLoai}
                  onDelete={() => handleDelete(item.maTheLoai)}
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
              {editItem ? 'Sửa thể loại' : 'Thêm thể loại'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label className='block mb-1'>Tên Thể Loại</label>
                <input
                  type="text"
                  name="tenTheLoai"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                  placeholder="Tên thể loại..."
                  value={formData.tenTheLoai}
                  onChange={handleChange}
                  required
                />
              </div>


              <div>
                <label className='block mb-1'>Mô tả</label>
                <textarea
                  name="moTa"
                  rows="3"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                  placeholder="Mô tả thể loại..."
                  value={formData.moTa}
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

export default TheLoai
