import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPhims } from '../../redux/features/phimSlice'
import toast from 'react-hot-toast'
import { PlusIcon, PencilIcon, Trash2Icon, EyeIcon, SearchIcon } from 'lucide-react'
import PhimForm from '../../components/admin/PhimForm'
import useApi from '../../hooks/useApi'
import Pagination from '../../components/admin/Paginnation'
import DeleteForm from '../../components/admin/DeleteForm'
import PhimDetail from '../../components/admin/ChiTietPhim'
import SearchInput from '../../components/SearchInput'
import { formatDate } from '../../lib/dateFormat'

const QuanLyPhim = () => {
  const api = useApi(true)
  const dispatch = useDispatch()
  const { items: phims, status, totalPages } = useSelector((state) => state.phim)

  const [showDetail, setShowDetail] = useState(false);
  const [detailPhim, setDetailPhim] = useState(null);

  const [showModal, setShowModal] = useState(false)
  const [editPhim, setEditPhim] = useState(null)
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;
  const [filterStatus, setFilterStatus] = useState("")

  useEffect(() => {
    dispatch(fetchPhims({ page: currentPage, limit, search, trangThaiChieu: filterStatus }))
  }, [dispatch, currentPage, search, filterStatus])


  const handleSubmit = async (formData) => {
    try {
      if (editPhim) {
        const res = await api.put(`/phim/${editPhim.maPhim}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success(res.data.message || 'Cập nhật phim thành công!')
      } else {
        const res = await api.post('/phim', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success(res.data.message || 'Thêm phim thành công!')
      }
      setShowModal(false)
      setEditPhim(null)
      dispatch(fetchPhims({ page: currentPage, limit, search }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi thao tác!')
    }
  }

  const handleDelete = async (maPhim) => {
    try {
      const res = await api.delete(`/phim/${maPhim}`)
      toast.success(res.data.message || "Xoá phim thành công!")
      dispatch(fetchPhims({ page: currentPage, limit, search }))
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Xoá thất bại!")
    }
  }

  const handleEdit = (phim) => {
    setEditPhim(phim)
    setShowModal(true)
  }

  console.log(phims);
  console.log(filterStatus);



  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold max-md:text-2xl">Quản lý phim</h1>
        <button
          onClick={() => {
            setShowModal(true)
            setEditPhim(null)
          }}
          className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer hover:bg-primary/80 transition"
        >
          <PlusIcon size={18} /> <span className='max-md:hidden'>Thêm phim</span>
        </button>
      </div>

      <div className='flex flex-wrap gap-3 mb-4'>
        <SearchInput
          search={search}
          setSearch={setSearch}
          setCurrentPage={setCurrentPage}
          item="tên phim"
        />

        {/* Trạng thái */}
        <select
          className="border border-primary/70 px-3 py-2 bg-black h-[3rem] outline-none cursor-pointer"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đang chiếu">Đang chiếu</option>
          <option value="Sắp chiếu">Sắp chiếu</option>
          <option value="Ngừng chiếu">Ngừng chiếu</option>
        </select>
      </div>

      {status === 'loading' ? (
        <p>Đang tải danh sách phim...</p>
      ) : (
        <table className="w-full border-b border-primary/30 rounded-lg text-sm">
          <thead className="bg-primary/70 text-white">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">Poster</th>
              <th className="p-2 text-left">Tên phim</th>
              <th className="p-2">Thời lượng</th>
              <th className="p-2">Ngày công chiếu</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {phims?.map((phim, index) => (
              <tr key={phim.maPhim} className="text-center border-b border-primary/30">
                <td className="p-2">{(currentPage - 1) * limit + index + 1}</td>
                <td className="p-2">
                  <img
                    src={phim.poster}
                    alt={phim.tenPhim}
                    className="w-14 h-20 object-cover mx-auto rounded"
                  />
                </td>
                <td className="p-2 font-medium text-left">{phim.tenPhim}</td>
                <td className="p-2">{phim.thoiLuong || '-'} Phút</td>
                <td className="p-2">
                  {phim.ngayCongChieu
                    ? formatDate(phim.ngayCongChieu)
                    : '-'}
                </td>
                <td className='p-2'>
                  {phim.trangThaiChieu}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => {
                      setDetailPhim(phim);
                      setShowDetail(true);
                    }}
                    className="p-2 text-blue-500 hover:bg-primary/20 rounded cursor-pointer"
                  >
                    <EyeIcon size={18} />
                  </button>

                  <button
                    onClick={() => handleEdit(phim)}
                    className="p-2 text-gray-400 hover:bg-primary/20 rounded cursor-pointer"
                  >
                    <PencilIcon size={18} />
                  </button>
                  <DeleteForm
                    title="Phim"
                    itemName={phim.tenPhim}
                    onDelete={() => handleDelete(phim.maPhim)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {showDetail && (
        <PhimDetail
          phim={detailPhim}
          onClose={() => setShowDetail(false)}
        />
      )}

      {showModal && (
        <PhimForm
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          editPhim={editPhim}
        />
      )}
    </div>
  )
}

export default QuanLyPhim
