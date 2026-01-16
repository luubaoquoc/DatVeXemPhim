import React, { useEffect, useState } from "react"
import { PlusIcon, PencilIcon, Trash2Icon, SearchIcon } from "lucide-react"
import toast from "react-hot-toast"
import useApi from "../../hooks/useApi"
import Pagination from "../../components/admin/Paginnation"
import DeleteForm from "../../components/admin/DeleteForm"
import SearchInput from "../../components/SearchInput"
import { useSearchParams } from "react-router-dom"

const Rap = () => {
  const api = useApi(true)
  const [searchParams, setSearchParams] = useSearchParams();
  const [raps, setRaps] = useState([]);
  const [showModal, setShowModal] = useState(false)
  const [editRap, setEditRap] = useState(null)
  const [formData, setFormData] = useState({
    tenRap: "",
    diaChi: "",
    soDienThoai: "",
    hinhAnh: null,
    srcMap: "",
  })
  const [search, setSearch] = useState("")
  const currentPage = Number(searchParams.get("page")) || 1
  const setCurrentPage = (page) => {
    setSearchParams({
      page,
      search,
    });
  }
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10
  const [loading, setLoading] = useState(false)

  // Fetch API
  const fetchData = async () => {
    try {
      const res = await api.get("/rap", {
        params: { page: currentPage, limit, search }
      })
      setRaps(res.data.data)
      setTotalPages(res.data.totalPages)
    } catch {
      toast.error("Không thể tải danh sách phòng!")
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

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {

      const formDataObj = new FormData()
      formDataObj.append("tenRap", formData.tenRap)
      formDataObj.append("diaChi", formData.diaChi)
      formDataObj.append("soDienThoai", formData.soDienThoai)
      formDataObj.append("srcMap", formData.srcMap)

      if (formData.hinhAnh instanceof File) {
        formDataObj.append("hinhAnh", formData.hinhAnh)
      }
      if (editRap) {
        await api.put(`/rap/${editRap.maRap}`, formDataObj, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        toast.success("Cập nhật rạp thành công!")
      } else {
        await api.post("/rap", formDataObj, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        toast.success("Thêm rạp thành công!")
      }

      setShowModal(false)
      setEditRap(null)
      setFormData({
        tenRap: "",
        diaChi: "",
        soDienThoai: "",
        hinhAnh: null,
        srcMap: "",
      })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi thao tác!")
    } finally {
      setLoading(false)
    }
  }

  // Xóa phòng
  const handleDelete = async (maRap) => {
    try {
      await api.delete(`/rap/${maRap}`)
      toast.success("Xoá rạp thành công!")
      fetchData()
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Xoá thất bại!")
    }
  }


  // Mở modal thêm/sửa
  const openModal = (data = null) => {
    if (data) {
      setEditRap(data)
      setFormData({
        tenRap: data.tenRap || "",
        diaChi: data.diaChi || "",
        soDienThoai: data.soDienThoai || "",
        hinhAnh: data.hinhAnh || null,
        srcMap: data.srcMap || "",
      })
    } else {
      setEditRap(null)
      setFormData({ tenRap: "", diaChi: "", soDienThoai: "", hinhAnh: null, srcMap: "" })
    }
    setShowModal(true)
  }

  console.log(raps);


  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold max-md:text-2xl">Quản lý rạp</h1>

        <button
          onClick={() => { openModal() }}
          className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80 transition cursor-pointer"
        >
          <PlusIcon size={18} /> <span className="max-md:hidden">Thêm rạp</span>
        </button>
      </div>

      {/* Search */}
      <SearchInput
        item="rạp"
        search={search}
        onSearch={(value) => {
          setSearch(value)
          setSearchParams({
            page: 1,
            search: value,
          })
        }}
      />

      {/* Table */}

      <table className="w-full border-b border-primary/30 rounded-lg text-sm">
        <thead className="bg-primary/70 text-white">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2 text-left">Hình ảnh</th>
            <th className="p-2 text-left">Tên rạp</th>
            <th className="p-2 text-left">Địa chỉ</th>
            <th className="p-2 text-left">Số điện thoại</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="8" className="text-center py-10">
                Đang tải...
              </td>
            </tr>
          ) : raps.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-10">
                Không có rạp nào.
              </td>
            </tr>
          ) : (
          raps?.map((rap, index) => (
            <tr key={rap.maRap} className="text-center border-b border-primary/30">
              <td className="p-2">{index + 1}</td>
              <td className="p-2">
                <img
                  src={rap.hinhAnh || "Chưa cập nhật"}
                  alt={rap.tenRap}
                  className="w-16 h-16 object-cover rounded"
                />
              </td>
              <td className="p-2 font-medium text-left">{rap.tenRap}</td>
              <td className="p-2 text-left">{rap.diaChi}</td>
              <td className="p-2 text-left">{rap.soDienThoai}</td>

              <td className="p-2">
                <button
                  onClick={() => {
                    openModal(rap)
                  }}
                  className="p-2 text-gray-400 hover:bg-primary/20 rounded cursor-pointer"
                >
                  <PencilIcon size={18} />
                </button>

                <DeleteForm
                  title="Rạp"
                  itemName={rap.tenRap}
                  onDelete={() => handleDelete(rap.maRap)}
                />
              </td>
            </tr>
          ))
          )}
        </tbody>
      </table>


      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="bg-black/80 border border-primary p-6 rounded-lg w-200 overflow-y-auto max-h-[90vh] max-md:m-4">
            <h2 className="text-2xl font-semibold mb-6 text-primary text-center">
              {editRap ? 'Sửa Rạp' : 'Thêm Rạp'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div>
                    <label className='block mb-1 font-medium text-primary'>Tên rạp <span className="text-red-500">*</span></label>
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
                    <label className='block mb-1 font-medium text-primary'>Địa chỉ <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="diaChi"
                      className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                      value={formData.diaChi || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium text-primary">Số điện thoại <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="soDienThoai"
                      className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                      value={formData.soDienThoai || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className='block mb-1 font-medium text-primary'>Hình ảnh <span className="text-red-500">*</span></label>
                  <div className="">
                    <input
                      type="file"
                      accept="image/*"
                      name="hinhAnh"
                      className="w-full h-[3rem] p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                      onChange={handleChange}
                      required
                    />
                    {
                      formData.hinhAnh && (
                        <img
                          src={
                            formData.hinhAnh instanceof File
                              ? URL.createObjectURL(formData.hinhAnh)
                              : formData.hinhAnh
                          }
                          alt="Preview"
                          className="h-auto w-full object-cover mb-4 rounded"
                        />
                      )
                    }
                  </div>
                </div>
              </div>
              <div>
                <label className='block mb-1 font-medium text-primary'>Src Map</label>
                <input
                  type="text"
                  name="srcMap"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                  value={formData.srcMap || ""}
                  onChange={handleChange}
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
                    editRap ? 'Cập nhật' : 'Thêm'
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

export default Rap
