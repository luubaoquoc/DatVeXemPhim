import React, { useEffect, useState } from 'react'
import { PlusIcon, PencilIcon, Trash2Icon, SearchIcon } from 'lucide-react'
import useApi from '../../hooks/useApi'
import toast from 'react-hot-toast'
import Pagination from '../../components/admin/Paginnation'
import DeleteForm from '../../components/admin/DeleteForm'

const Banner = () => {
  const api = useApi(true)
  const [banners, setBanners] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [anh, setAnh] = useState('')
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)


  // Gọi API lấy danh sách đạo diễn
  const fetchBanner = async () => {
    try {
      const res = await api.get("/anhbanner")
      console.log(res);

      setBanners(res.data)
    } catch {
      toast.error('Lỗi tải danh sách đạo diễn!')
    }
  }

  useEffect(() => {
    fetchBanner()
  }, [])


  // Gửi form thêm/sửa
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    if (anh) {
      formData.append('anh', anh)
    }
    try {
      if (editItem) {
        await api.put(`/anhbanner/${editItem.maAnhBanner}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Cập nhật thành công!')
      } else {
        await api.post('/anhbanner', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Thêm mới thành công!')
      }

      setShowModal(false)
      setEditItem(null)
      setAnh(null)
      setPreview("")
      fetchBanner()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thao tác!')
    } finally {
      setLoading(false)
    }
  }

  // Xóa đạo diễn
  const handleDelete = async (maAnhBanner) => {
    try {
      await api.delete(`/anhbanner/${maAnhBanner}`)
      toast.success("Xoá banner thành công!")
      fetchBanner()
    } catch (err) {
      console.log(err);
      toast.error("Xoá thất bại!")
    }
  }

  // Mở modal thêm/sửa
  const openModal = (item = null) => {
    if (item) {
      setEditItem(item)
      setPreview(item.anh)
      setAnh(null)
    } else {
      setEditItem(null)
      setPreview("")
      setAnh(null)
    }
    setShowModal(true)
  }
  console.log(editItem);

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Quản lý Banner</h1>
        <button
          onClick={() => openModal()}
          className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80 transition cursor-pointer"
        >
          <PlusIcon size={18} /> Thêm banner
        </button>
      </div>

      <table className="w-full border-b border-primary/30 rounded-lg text-sm">
        <thead className="bg-primary/70 text-white">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2 ">Ảnh Banner</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {banners.map((item, index) => (
            <tr key={item.maAnhBanner} className="text-center border-b border-primary/30">
              <td className="p-2">{index + 1}</td>
              <td className="p-2 ">
                {item.anh ? (
                  <img src={item.anh} alt={`Banner ${index + 1}`} className="h-24 w-full object-contain rounded" />
                ) : (
                  "Chưa cập nhật"
                )}
              </td>

              <td className="p-2">
                <button
                  onClick={() => openModal(item)}
                  className="p-2 text-blue-400 hover:bg-primary/20 rounded cursor-pointer"
                >
                  <PencilIcon size={18} />
                </button>
                <DeleteForm
                  itemName={item.anh}
                  onDelete={() => handleDelete(item.maAnhBanner)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal thêm/sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-black/80 border border-primary p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              {editItem ? 'Sửa đạo diễn' : 'Thêm đạo diễn'}
            </h2>
            <form onSubmit={handleSubmit}>


              <div>
                <label className='block mb-1'>Ảnh Banner</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full p-2 mb-4 rounded bg-gray-700 border border-gray-600 text-white"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      setAnh(file)
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {preview && (
                  <img src={preview} className="h-32 w-full object-contain mb-3" />
                )}
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

export default Banner
