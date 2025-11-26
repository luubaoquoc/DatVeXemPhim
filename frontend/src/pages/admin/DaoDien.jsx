import React, { useEffect, useState } from 'react'
import { PlusIcon, PencilIcon, Trash2Icon, SearchIcon } from 'lucide-react'
import useApi from '../../hooks/useApi'
import toast from 'react-hot-toast'
import { formatDate } from '../../lib/dateFormat'
import Pagination from '../../components/admin/Paginnation'
import DeleteForm from '../../components/admin/DeleteForm'
import SearchInput from '../../components/SearchInput'

const DaoDien = () => {
  const api = useApi(true)
  const [daoDiens, setDaoDiens] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({
    tenDaoDien: '',
    anhDaiDien: '',
    ngaySinh: '',
    tieuSu: ''
  })
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10
  const [loading, setLoading] = useState(false);


  // Gọi API lấy danh sách đạo diễn
  const fetchData = async () => {
    try {
      const res = await api.get("/daodien", {
        params: { page: currentPage, limit, search }
      })
      setDaoDiens(res.data.data)
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Lỗi tải danh sách đạo diễn!')
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
        await api.put(`/daodien/${editItem.maDaoDien}`, formData)
        toast.success('Cập nhật thành công!')
      } else {
        await api.post('/daodien', formData)
        toast.success('Thêm mới thành công!')
      }

      setShowModal(false)
      setEditItem(null)
      setFormData({ tenDaoDien: '', anhDaiDien: '', ngaySinh: '', tieuSu: '' })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thao tác!')
    } finally {
      setLoading(false)
    }
  }

  // Xóa đạo diễn
  const handleDelete = async (maDaoDien) => {
    try {
      await api.delete(`/daodien/${maDaoDien}`)
      toast.success("Xoá đạo diễn thành công!")
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
        tenDaoDien: item.tenDaoDien || '',
        anhDaiDien: item.anhDaiDien || '',
        ngaySinh: item.ngaySinh ? new Date(item.ngaySinh).toISOString().split('T')[0] : '',
        tieuSu: item.tieuSu || ''
      })
    } else {
      setEditItem(null)
      setFormData({ tenDaoDien: '', anhDaiDien: '', ngaySinh: '', tieuSu: '' })
    }
    setShowModal(true)
  }
  console.log(editItem);

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Quản lý Đạo diễn</h1>
        <button
          onClick={() => openModal()}
          className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80 transition cursor-pointer"
        >
          <PlusIcon size={18} /> Thêm đạo diễn
        </button>
      </div>

      <SearchInput
        search={search}
        setSearch={setSearch}
        setCurrentPage={setCurrentPage}
      />

      <table className="w-full border-b border-primary/30 rounded-lg text-sm">
        <thead className="bg-primary/70 text-white">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2 text-left">Tên đạo diễn</th>
            <th className="p-2 text-left">Ảnh đại diện</th>
            <th className="p-2 text-left">Ngày sinh</th>
            <th className="p-2 text-left">Tiểu sử</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {daoDiens.map((item, index) => (
            <tr key={item.maDaoDien} className="text-center border-b border-primary/30">
              <td className="p-2">{index + 1}</td>
              <td className="p-2 text-left">{item.tenDaoDien}</td>
              <td className="p-2 text-left">
                {item.anhDaiDien ? (
                  <img src={item.anhDaiDien} alt={item.tenDaoDien} className="h-12 w-12 object-cover rounded" />
                ) : (
                  "Chưa cập nhật"
                )}
              </td>
              <td className="p-2 text-left">{formatDate(item.ngaySinh) || "Chưa cập nhật"}</td>
              <td className="p-2 text-left">{item.tieuSu || "Chưa cập nhật"}</td>
              <td className="p-2">
                <button
                  onClick={() => openModal(item)}
                  className="p-2 text-blue-400 hover:bg-primary/20 rounded cursor-pointer"
                >
                  <PencilIcon size={18} />
                </button>
                <DeleteForm
                  title="Đạo diễn"
                  itemName={item.tenDaoDien}
                  onDelete={() => handleDelete(item.maDaoDien)}
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
              {editItem ? 'Sửa đạo diễn' : 'Thêm đạo diễn'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label className='block mb-1'>Tên Đạo Diễn</label>
                <input
                  type="text"
                  name="tenDaoDien"
                  className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 text-white"
                  placeholder="Tên đạo diễn..."
                  value={formData.tenDaoDien}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className='block mb-1'>Ảnh đại diện (URL)</label>
                <input
                  type="text"
                  name="anhDaiDien"
                  className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 text-white"
                  placeholder="URL ảnh đại diện..."
                  value={formData.anhDaiDien}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className='block mb-1'>Ngày sinh</label>
                <input
                  type="date"
                  name="ngaySinh"
                  className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 text-white"
                  value={formData.ngaySinh}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className='block mb-1'>Tiểu sử</label>
                <textarea
                  name="tieuSu"
                  rows="3"
                  className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 text-white"
                  placeholder="Tiểu sử đạo diễn..."
                  value={formData.tieuSu}
                  onChange={handleChange}
                ></textarea>
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

export default DaoDien
