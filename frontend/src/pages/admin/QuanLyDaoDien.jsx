import React, { useEffect, useState } from 'react'
import { PlusIcon, PencilIcon } from 'lucide-react'
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
    anhDaiDien: null,       // File hoặc URL
    ngaySinh: '',
    tieuSu: ''
  })

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10
  const [loading, setLoading] = useState(false)

  // ===========================
  // FETCH LIST
  // ===========================
  const fetchData = async () => {
    try {
      const res = await api.get("/daodien", {
        params: { page: currentPage, limit, search }
      })
      setDaoDiens(res.data.data)
      setTotalPages(res.data.totalPages)
    } catch {
      toast.error('Lỗi tải danh sách đạo diễn!')
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, search])


  // ===========================
  // HANDLE FORM CHANGE
  // ===========================
  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }



  // ===========================
  // SUBMIT FORM
  // ===========================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()
      data.append('tenDaoDien', formData.tenDaoDien)
      data.append('ngaySinh', formData.ngaySinh)
      data.append('tieuSu', formData.tieuSu)

      if (formData.anhDaiDien instanceof File) {
        data.append('anhDaiDien', formData.anhDaiDien)
      }

      if (editItem) {
        await api.put(`/daodien/${editItem.maDaoDien}`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        toast.success("Cập nhật thành công!")
      } else {
        await api.post(`/daodien`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        toast.success("Thêm mới thành công!")
      }

      setShowModal(false)
      setEditItem(null)
      setFormData({ tenDaoDien: '', anhDaiDien: null, ngaySinh: '', tieuSu: '' })
      fetchData()

    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi thao tác!")
    } finally {
      setLoading(false)
    }
  }


  // ===========================
  // DELETE
  // ===========================
  const handleDelete = async (id) => {
    try {
      await api.delete(`/daodien/${id}`)
      toast.success("Xoá thành công!")
      fetchData()
    } catch {
      toast.error("Lỗi xoá đạo diễn!")
    }
  }


  // ===========================
  // OPEN MODAL (EDIT or CREATE)
  // ===========================
  const openModal = (item = null) => {
    if (item) {
      setEditItem(item)
      setFormData({
        tenDaoDien: item.tenDaoDien || '',
        anhDaiDien: item.anhDaiDien || null,
        ngaySinh: item.ngaySinh ? new Date(item.ngaySinh).toISOString().split('T')[0] : '',
        tieuSu: item.tieuSu || ''
      })
    } else {
      setEditItem(null)
      setFormData({ tenDaoDien: '', anhDaiDien: null, ngaySinh: '', tieuSu: '' })
    }

    setShowModal(true)
  }


  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Quản lý Đạo diễn</h1>

        <button
          onClick={() => openModal()}
          className="bg-primary px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80 cursor-pointer"
        >
          <PlusIcon size={18} /> Thêm đạo diễn
        </button>
      </div>

      <SearchInput
        search={search}
        setSearch={setSearch}
        setCurrentPage={setCurrentPage}
        item="tên đạo diễn"
      />

      {/* TABLE */}
      <table className="w-full border-b border-primary/30 rounded-lg text-sm">
        <thead className="bg-primary/70 text-white">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2 text-left">Ảnh đại diện</th>
            <th className="p-2 text-left">Tên đạo diễn</th>
            <th className="p-2 text-left">Ngày sinh</th>
            <th className="p-2 text-left">Tiểu sử</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {daoDiens.map((item, index) => (
            <tr key={item.maDaoDien} className="border-b border-primary/30">
              <td className="p-2 text-center">{index + 1}</td>

              <td className="p-2 text-left">
                {item.anhDaiDien ? (
                  <img
                    src={item.anhDaiDien}
                    className="h-12 w-12 object-cover rounded"
                    alt=""
                  />
                ) : "Chưa có ảnh"}
              </td>

              <td className="p-2 text-left">{item.tenDaoDien}</td>
              <td className="p-2 text-left">{formatDate(item.ngaySinh) || "Chưa cập nhật"}</td>
              <td className="p-2 text-left">{item.tieuSu || "Chưa cập nhật"}</td>

              <td className="p-2 text-center">
                <button
                  onClick={() => openModal(item)}
                  className="p-2 text-gray-400 hover:bg-primary/20 rounded cursor-pointer"
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-black/80 border border-primary p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              {editItem ? "Sửa đạo diễn" : "Thêm đạo diễn"}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Tên */}
              <div>
                <label className="block mb-1">Tên Đạo Diễn</label>
                <input
                  type="text"
                  name="tenDaoDien"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600"
                  value={formData.tenDaoDien}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Ảnh */}
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

              {/* Ngày sinh */}
              <div>
                <label className="block mb-1">Ngày sinh</label>
                <input
                  type="date"
                  name="ngaySinh"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600"
                  value={formData.ngaySinh}
                  onChange={handleChange}
                />
              </div>

              {/* Tiểu sử */}
              <div>
                <label className="block mb-1">Tiểu sử</label>
                <textarea
                  name="tieuSu"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600"
                  rows={3}
                  value={formData.tieuSu}
                  onChange={handleChange}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 rounded cursor-pointer hover:bg-gray-500"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded cursor-pointer hover:bg-primary/80 ${loading ? "bg-primary/40" : "bg-primary"
                    } flex items-center gap-2`}
                >
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

export default DaoDien
