import React, { useEffect, useState } from "react"
import { PlusIcon, PencilIcon, Trash2Icon, SearchIcon } from "lucide-react"
import toast from "react-hot-toast"
import useApi from "../../hooks/useApi"
import Pagination from "../../components/admin/Paginnation"
import DeleteForm from "../../components/admin/DeleteForm"
import SearchInput from "../../components/SearchInput"
import { useSelector } from "react-redux"

const QuanLyTaiKhoan = () => {
  const api = useApi(true)

  const user = useSelector((state) => state.auth.user)

  const [taiKhoans, setTaiKhoans] = useState([])
  const [vaiTros, setVaiTros] = useState([])
  const [raps, setRaps] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editTaiKhoan, setEditTaiKhoan] = useState(null)
  const [formData, setFormData] = useState({
    hoTen: "",
    email: "",
    matKhau: "",
    soDienThoai: "",
    maVaiTro: "",
    maRap: ""
  })
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10
  const [loading, setLoading] = useState(false)
  const [filterRole, setFilterRole] = useState("")
  const [filterRap, setFilterRap] = useState("")


  const isRapRequired = Number(formData.maVaiTro) === 2 || Number(formData.maVaiTro) === 3;


  // Fetch API
  const fetchData = async () => {
    try {
      const res = await api.get("/taikhoan", {
        params: { page: currentPage, limit, search, maVaiTro: filterRole, maRap: filterRap }
      })
      setTaiKhoans(res.data.data)
      setTotalPages(res.data.totalPages)
    } catch {
      toast.error("Không thể tải danh sách tài khoản!")
    }
  }


  const fetchVaiTros = async () => {
    try {
      const res = await api.get("/taikhoan/vaitro");
      setVaiTros(res.data.data || res.data); // tùy API trả ra
    } catch {
      toast.error("Không thể tải danh sách vai trò!");
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
    fetchVaiTros()
    fetchRaps()
  }, [currentPage, search, filterRole, filterRap])

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset rạp nếu vai trò không phải nhân viên / quản lý rạp
    if (name === "maVaiTro") {
      const numericValue = Number(value);
      const requireRap = numericValue === 2 || numericValue === 3;

      setFormData(prev => ({
        ...prev,
        [name]: value,
        maRap: requireRap ? prev.maRap : ""
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };


  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editTaiKhoan) {
        await api.put(`/taikhoan/${editTaiKhoan.maTaiKhoan}`, formData)
        toast.success("Cập nhật tài khoản thành công!")
      } else {
        await api.post("/taikhoan", formData)
        toast.success("Thêm tài khoản thành công!")
      }

      setShowModal(false)
      setEditTaiKhoan(null)
      setFormData({
        hoTen: "",
        email: "",
        matKhau: "",
        soDienThoai: "",
        maVaiTro: "",
        maRap: ""
      })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi thao tác!")
    } finally {
      setLoading(false)
    }
  }

  // Xóa phòng
  const handleDelete = async (maTaiKhoan) => {
    try {
      await api.delete(`/taikhoan/${maTaiKhoan}`)
      toast.success("Xoá tài khoản thành công!")
      fetchData()
    } catch (err) {
      console.log(err);
      toast.error("Xoá thất bại!")
    }
  }


  // Mở modal thêm/sửa
  const openModal = (data = null) => {
    if (data) {
      setEditTaiKhoan(data)
      setFormData({
        hoTen: data.hoTen,
        email: data.email,
        matKhau: "",
        soDienThoai: data.soDienThoai,
        maVaiTro: data.maVaiTro,
        maRap: data.maRap
      })
    } else {
      setEditTaiKhoan(null)
      setFormData({ hoTen: "", email: "", matKhau: "", soDienThoai: "", maVaiTro: "", maRap: "" })
    }
    setShowModal(true)
  }

  const filteredVaiTros = vaiTros.filter(vaiTro => {
    // Admin: thấy tất cả
    if (user?.vaiTro === 4) return true;

    // Quản lý rạp: chỉ thấy NV rạp + QL rạp
    if (user?.vaiTro === 3) {
      return vaiTro.maVaiTro === 2 || vaiTro.maVaiTro === 3;
    }

    return false;
  });

  const filteredRaps = user?.vaiTro === 4
    ? raps
    : raps.filter(rap => rap.maRap === user.maRap);

  console.log(taiKhoans);


  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Quản lý tài khoản</h1>

        <button
          onClick={() => { openModal() }}
          className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/80 transition cursor-pointer"
        >
          <PlusIcon size={18} /> Thêm tài khoản
        </button>
      </div>

      <div className='flex flex-wrap gap-3'>
        <SearchInput
          search={search}
          setSearch={setSearch}
          setCurrentPage={setCurrentPage}
          item="tên tài khoản"
        />

        {/* Trạng thái */}
        <select
          className="border border-primary/70 px-3 py-2 bg-black h-[3rem] outline-none cursor-pointer"
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Tất cả vai trò</option>
          {filteredVaiTros.map(vaiTro => (
            <option key={vaiTro.maVaiTro} value={vaiTro.maVaiTro}>
              {vaiTro.tenVaiTro}
            </option>
          ))}
        </select>
        {user.vaiTro == 4 && (

          <select
            className="border border-primary/70 px-3 py-2 bg-black h-[3rem] outline-none cursor-pointer"
            value={filterRap}
            onChange={(e) => {
              setFilterRap(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tất cả rạp</option>
            {raps.map(rap => (
              <option key={rap.maRap} value={rap.maRap}>
                {rap.tenRap}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <table className="w-full border-b border-primary/30 rounded-lg text-sm">
        <thead className="bg-primary/70 text-white">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2">Mã tài khoản</th>
            <th className="p-2 text-left">Họ tên</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Vai trò</th>
            <th className="p-2 text-left">Rạp</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {taiKhoans?.map((taiKhoan, index) => (
            <tr key={taiKhoan.maTaiKhoan} className="text-center border-b border-primary/30">
              <td className="p-2">{(index + 1)}</td>
              <td className="p-2">{taiKhoan.maTaiKhoan}</td>
              <td className="p-2 font-medium text-left">{taiKhoan.hoTen}</td>
              <td className="p-2 text-left">{taiKhoan.email}</td>
              <td className="p-2 text-left">{taiKhoan.vaiTro?.tenVaiTro}</td>
              <td className="p-2 text-left">{taiKhoan.rapLamViec ? taiKhoan.rapLamViec.tenRap : "-"}</td>

              <td className="p-2 flex justify-center">
                <button
                  onClick={() => {
                    openModal(taiKhoan)
                  }}
                  className="p-2 text-gray-400 hover:bg-primary/20 rounded cursor-pointer"
                >
                  <PencilIcon size={18} />
                </button>

                <DeleteForm
                  title="Tài khoản"
                  itemName={taiKhoan.hoTen}
                  onDelete={() => handleDelete(taiKhoan.maTaiKhoan)}
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
          <div className="bg-black/80 border border-primary p-6 rounded-lg w-96">
            <h2 className="text-2xl font-semibold mb-4 text-primary text-center">
              {editTaiKhoan ? 'Sửa tài khoản' : 'Thêm tài khoản'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label className='block mb-1 font-medium text-primary'>Họ tên</label>
                <input
                  type="text"
                  name="hoTen"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                  placeholder="Nhập họ tên..."
                  value={formData.hoTen}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className='block mb-1 font-medium text-primary'>Email</label>
                <input
                  type="email"
                  name="email"
                  disabled={editTaiKhoan ? true : false}
                  className={`w-full p-2 mb-4 rounded ${editTaiKhoan ? "bg-gray-600 cursor-not-allowed" : "bg-[#111]"} border border-gray-600 text-white `}
                  value={formData.email || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                {!editTaiKhoan && (
                  <>
                    <label className="block mb-1 font-medium text-primary">Mật khẩu</label>
                    <input
                      type="password"
                      name="matKhau"
                      className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                      value={formData.matKhau}
                      onChange={handleChange}
                      required
                    />
                  </>
                )}

              </div>
              <div>
                <label className="block mb-1 font-medium text-primary">Số điện thoại</label>
                <input
                  type="text"
                  name="soDienThoai"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white"
                  value={formData.soDienThoai || ""}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-primary">Chọn vai trò</label>
                <select
                  name="maVaiTro"
                  className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white cursor-pointer"
                  value={formData.maVaiTro}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn vai trò --</option>
                  {filteredVaiTros.map((vaiTro) => (
                    <option key={vaiTro.maVaiTro} value={vaiTro.maVaiTro}>
                      {vaiTro.tenVaiTro}
                    </option>
                  ))}
                </select>
              </div>

              {isRapRequired && (
                <div>
                  <label className="block mb-1 font-medium text-primary">Chọn rạp</label>
                  <select
                    name="maRap"
                    className="w-full p-2 mb-4 rounded bg-[#111] border border-gray-600 text-white cursor-pointer"
                    value={formData.maRap}
                    onChange={handleChange}
                    required={isRapRequired}
                  >
                    <option value="">-- Chọn rạp --</option>
                    {filteredRaps.map((rap) => (
                      <option key={rap.maRap} value={rap.maRap}>
                        {rap.tenRap}
                      </option>
                    ))}
                  </select>
                </div>
              )}



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
                    editTaiKhoan ? 'Cập nhật' : 'Thêm'
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

export default QuanLyTaiKhoan
