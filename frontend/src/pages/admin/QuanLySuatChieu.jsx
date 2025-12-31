import React, { useEffect, useState } from "react";
import useApi from "../../hooks/useApi";
import toast from "react-hot-toast";
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react";
import SuatChieuForm from "../../components/admin/SuatChieuForm";
import Pagination from "../../components/admin/Paginnation";
import isoTimeFormat from "../../lib/isoTimeFormat";
import { formatDate } from "../../lib/dateFormat";
import DeleteForm from "../../components/admin/DeleteForm";
import SearchInput from "../../components/SearchInput";

const QuanLySuatChieu = () => {
  const api = useApi(true)

  const [suatChieus, setSuatChieus] = useState([])
  const [phong, setPhong] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  let limit = 10

  const [search, setSearch] = useState("")
  const [filterPhong, setFilterPhong] = useState("")
  const [filterDate, setFilterDate] = useState("");

  console.log(suatChieus);

  const fetchSuatChieus = async () => {
    try {
      const res = await api.get("/suatchieu", {
        params: {
          page: currentPage,
          limit,
          search: search,
          maPhong: filterPhong,
          date: filterDate,
        },
      });

      setSuatChieus(res.data.data);
      setTotalPages(res.data.totalPages)
    } catch (error) {
      console.log(error);
      toast.error("Lỗi tải danh sách suất chiếu!")
    }
  };

  const fetchPhongs = async () => {
    const res = await api.get("/phongChieu", {
      params: {
        limit: 1000,
      },
    })
    setPhong(res.data.data)
  };


  useEffect(() => {
    fetchSuatChieus()
    fetchPhongs()
  }, [currentPage, search, filterPhong, filterDate]);

  const handleSubmit = async (data) => {
    try {
      if (editItem) {
        await api.put(`/suatchieu/${editItem.maSuatChieu}`, data)
        toast.success("Cập nhật suất chiếu thành công!")
      } else {
        await api.post("/suatchieu", data)
        toast.success("Thêm suất chiếu thành công!")
      }

      setShowModal(false);
      setEditItem(null);
      fetchSuatChieus();
    } catch (e) {
      toast.error(e.response?.data?.message || "Lỗi thao tác!")
    }
  };

  const handleDelete = async (maSuatChieu) => {
    try {
      await api.delete(`/suatchieu/${maSuatChieu}`)
      toast.success("Đã xoá!");

      fetchSuatChieus();
    } catch {
      toast.error("Xoá thất bại!");
    }
  }

  console.log(phong);


  return (
    <div className="p-6 text-white">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-semibold max-md:text-2xl">Quản lý suất chiếu</h1>
        <button
          className="bg-primary px-4 py-2 rounded flex items-center gap-2 cursor-pointer hover:bg-primary/80 text-white"
          onClick={() => { setShowModal(true); setEditItem(null); }}
        >
          <PlusIcon size={18} /> <span className="max-md:hidden">Thêm suất chiếu</span>
        </button>
      </div>

      <div className='flex flex-wrap gap-3 mb-4'>
        <SearchInput
          search={search}
          setSearch={setSearch}
          setCurrentPage={setCurrentPage}
          item="tên phim"
        />

        <select
          className="border border-primary/70 px-3 py-2 bg-black h-[3rem] outline-none cursor-pointer"
          value={filterPhong}
          onChange={(e) => {
            setFilterPhong(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Tất cả phòng</option>
          {phong.map(phong => (
            <option key={phong.maPhong} value={phong.maPhong}>
              {phong.tenPhong}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="border border-primary/70 px-3 py-2 bg-black h-[3rem] outline-none cursor-pointer"
          value={filterDate}
          onChange={(e) => {
            setFilterDate(e.target.value)
            setCurrentPage(1)
          }}
        />

      </div>

      <table className="w-full border-b border-primary/30">
        <thead className="bg-primary/70">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2">Phim</th>
            <th className="p-2">Phòng</th>
            <th className="p-2">Ngày chiếu</th>
            <th className="p-2">Bắt đầu</th>
            <th className="p-2">Kết thúc</th>
            <th className="p-2">Giá vé</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {suatChieus.map((sc, index) => (
            <tr
              key={sc.maSuatChieu}
              className="border-b border-primary/20 text-center"
            >
              <td className="p-2">{(currentPage - 1) * limit + index + 1}</td>
              <td className="p-2">{sc.phim?.tenPhim || sc.maPhim}</td>
              <td className="p-2">{sc.phongChieu?.tenPhong}</td>

              <td className="p-2">{formatDate(sc.gioBatDau)}</td>

              <td className="p-2">
                {isoTimeFormat(sc.gioBatDau)}
              </td>

              <td className="p-2">
                {sc.gioKetThuc
                  ? isoTimeFormat(sc.gioKetThuc)
                  : "-"}
              </td>

              <td className="p-2">{sc.giaVeCoBan || "-"}</td>

              <td className="p-2">
                <button
                  className="p-2 text-gray-400 hover:bg-primary/20 rounded cursor-pointer"
                  onClick={() => { setEditItem(sc); setShowModal(true); }}
                >
                  <PencilIcon size={18} />
                </button>

                <DeleteForm
                  title="Suất chiếu"
                  itemName={sc.phim?.tenPhim || sc.maPhim}
                  onDelete={() => handleDelete(sc.maSuatChieu)}
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
        <SuatChieuForm
          editItem={editItem}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default QuanLySuatChieu;
