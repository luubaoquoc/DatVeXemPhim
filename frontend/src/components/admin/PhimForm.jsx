import React, { useEffect, useState } from 'react'
import Select from "react-select";
import toast from 'react-hot-toast'
import useApi from '../../hooks/useApi'

const PhimForm = ({ onSubmit, onClose, editPhim }) => {

  const api = useApi(true);
  const [formData, setFormData] = useState({
    tenPhim: '',
    moTa: '',
    thoiLuong: '',
    ngayCongChieu: '',
    maDaoDien: '',
    maTheLoai: [],
    maDienVien: [],
    trailer: '',
    poster: '',
    trangThaiChieu: '',
    phanLoai: '',
    ngonNgu: '',
    phuDe: '',
  });

  const [daoDiens, setDaoDiens] = useState([]);
  const [dienViens, setDienViens] = useState([]);
  const [theLoais, setTheLoais] = useState([]);
  const [loading, setLoading] = useState(false);



  // Load danh mục
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dd, dv, tl] = await Promise.all([
          api.get('/daodien'),
          api.get('/dienvien'),
          api.get('/theloai')
        ]);

        setDaoDiens(dd.data.data);
        setDienViens(dv.data.data);
        setTheLoais(tl.data.data);
      } catch (err) {
        console.log(err);
        toast.error('Không thể tải danh mục!');
      }
    };
    fetchData();
  }, [api]);


  // Nếu đang sửa
  useEffect(() => {
    if (editPhim) {
      setFormData({
        tenPhim: editPhim.tenPhim || '',
        moTa: editPhim.noiDung || '',
        thoiLuong: editPhim.thoiLuong || '',
        ngayCongChieu: editPhim.ngayCongChieu
          ? new Date(editPhim.ngayCongChieu).toISOString().split('T')[0]
          : '',
        maDaoDien: editPhim.maDaoDien || '',
        maTheLoai: editPhim.theLoais?.map(t => t.maTheLoai) || [],
        maDienVien: editPhim.dienViens?.map(v => v.maDienVien) || [],
        trailer: editPhim.trailer || '',
        poster: editPhim.poster || '',
        posterFile: null,
        trangThaiChieu: editPhim.trangThaiChieu || '',
        phanLoai: editPhim.phanLoai || '',
        ngonNgu: editPhim.ngonNgu || '',
        phuDe: editPhim.phuDe || '',
      });
    }
  }, [editPhim]);

  // Xử lý file
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      return setFormData({ ...formData, posterFile: files[0] });
    }
    setFormData({ ...formData, [name]: value });
  };

  // === react-select handlers ===
  const handleSelectDaoDien = (selected) => {
    setFormData({ ...formData, maDaoDien: selected?.value || "" });
  };

  const handleSelectTheLoai = (selected) => {
    setFormData({ ...formData, maTheLoai: selected.map(i => i.value) });
  };

  const handleSelectDienVien = (selected) => {
    setFormData({ ...formData, maDienVien: selected.map(i => i.value) });
  };

  // Gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)

    try {
      const data = new FormData();
      data.append('tenPhim', formData.tenPhim);
      data.append('moTa', formData.moTa);
      data.append('thoiLuong', formData.thoiLuong);
      data.append('ngayCongChieu', formData.ngayCongChieu);
      data.append('maDaoDien', formData.maDaoDien);
      data.append('trailer', formData.trailer);
      data.append('trangThaiChieu', formData.trangThaiChieu);
      data.append('phanLoai', formData.phanLoai);
      data.append('ngonNgu', formData.ngonNgu);
      data.append('phuDe', formData.phuDe);

      data.append('maTheLoai', JSON.stringify(formData.maTheLoai));
      data.append('maDienVien', JSON.stringify(formData.maDienVien));

      if (formData.posterFile) {
        data.append('poster', formData.posterFile);
      }

      await onSubmit(data);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi gửi dữ liệu');
    } finally {
      setLoading(false)
    }
  };

  // Tạo option cho react-select
  const daoDienOptions = daoDiens.map(d => ({
    value: d.maDaoDien,
    label: d.tenDaoDien
  }));

  const theLoaiOptions = theLoais.map(t => ({
    value: t.maTheLoai,
    label: t.tenTheLoai
  }));

  const dienVienOptions = dienViens.map(v => ({
    value: v.maDienVien,
    label: v.tenDienVien
  }));



  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-black/90 border border-primary p-6 rounded-xl w-[950px] text-white overflow-y-auto no-scrollbar max-h-[90vh]">

        <h2 className="text-2xl font-semibold mb-4 text-center text-primary">
          {editPhim ? 'Sửa phim' : 'Thêm phim mới'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Tên phim */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-3'>
              <div>
                <label className='block mb-1 font-medium text-primary'>Tên phim</label>
                <input
                  name="tenPhim"
                  value={formData.tenPhim}
                  onChange={handleChange}
                  placeholder='Nhập tên phim ...'
                  className="w-full p-2 rounded bg-[#111] border border-gray-700"
                  required
                />
              </div>

              {/* Đạo diễn - react-select */}
              <div className="flex flex-col gap-1">
                <label className="font-medium text-primary">Đạo diễn</label>
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={daoDienOptions}
                  value={daoDienOptions.find(d => d.value === formData.maDaoDien) || null}
                  onChange={handleSelectDaoDien}
                  placeholder="Chọn đạo diễn..."
                  isSearchable
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium text-primary">Thể loại</label>
                <Select
                  isMulti
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={theLoaiOptions}
                  value={theLoaiOptions.filter(t => formData.maTheLoai.includes(t.value))}
                  onChange={handleSelectTheLoai}
                  placeholder="Chọn thể loại..."
                  isSearchable
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-medium text-primary">Diễn viên</label>
                <Select
                  isMulti
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={dienVienOptions}
                  value={dienVienOptions.filter(v => formData.maDienVien.includes(v.value))}
                  onChange={handleSelectDienVien}
                  placeholder="Chọn diễn viên..."
                  isSearchable
                />
              </div>
            </div>
            <div>
              {/* Poster */}
              <div>
                <label className="block mb-1 font-medium text-primary">Ảnh Poster</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-[#111] border border-gray-700 cursor-pointer"
                />
                {(formData.posterFile || formData.poster) && (
                  <img
                    src={
                      formData.posterFile
                        ? URL.createObjectURL(formData.posterFile)
                        : formData.poster
                    }
                    className="w-56 h-60 object-contain mt-2 mx-auto rounded"
                  />
                )}


              </div>
            </div>
          </div>

          {/* Nội dung phim */}
          <div>
            <label className="font-medium text-primary">Nội dung phim</label>
            <textarea
              name="moTa"
              value={formData.moTa}
              placeholder='Nhập nội dung phim ...'
              onChange={handleChange}
              className="w-full p-2 rounded bg-[#111] border border-gray-700"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-primary">Thời lượng (phút)</label>
              <input
                name="thoiLuong"
                type="number"
                placeholder='Nhập thời lượng phim ...'
                value={formData.thoiLuong}
                onChange={handleChange}
                className="w-full p-2 rounded bg-[#111] border border-gray-700"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-primary">Ngày công chiếu</label>
              <input
                name="ngayCongChieu"
                type="date"
                value={formData.ngayCongChieu}
                onChange={handleChange}
                className="w-full p-2 rounded bg-[#111] border border-gray-700"
              />
            </div>

            <div>
              <label className='block mb-1 font-medium text-primary'>Trạng thái</label>
              <select
                name="trangThaiChieu"
                value={formData.trangThaiChieu}
                onChange={handleChange}
                className="w-full p-2 rounded bg-[#111] border border-gray-700 cursor-pointer"
              >
                <option value="">-- Chọn trạng thái --</option>
                <option value="Đang chiếu">Đang chiếu</option>
                <option value="Sắp chiếu">Sắp chiếu</option>
                <option value="Ngừng chiếu">Ngừng chiếu</option>
              </select>

            </div>
            <div>
              <label className="block mb-1 font-medium text-primary">Độ tuổi</label>
              <select
                name="phanLoai"
                value={formData.phanLoai}
                onChange={handleChange}
                className="w-full p-2 rounded bg-[#111] border border-gray-700 cursor-pointer"
              >
                <option value="">-- Chọn độ tuổi --</option>
                <option value="P">P</option>
                <option value="T13">T13</option>
                <option value="T16">T16</option>
                <option value="C18">C18</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium text-primary">Ngôn ngữ</label>
              <input
                name="ngonNgu"
                value={formData.ngonNgu}
                placeholder='Nhập ngôn ngữ ...'
                onChange={handleChange}
                className="w-full p-2 rounded bg-[#111] border border-gray-700"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-primary">Phụ đề</label>
              <input
                name="phuDe"
                value={formData.phuDe}
                placeholder='Nhập phụ đề ...'
                onChange={handleChange}
                className="w-full p-2 rounded bg-[#111] border border-gray-700"
              />
            </div>
          </div>

          {/* Trailer */}
          <div>
            <label className="block mb-1 font-medium text-primary">Trailer</label>
            <input
              type="text"
              name="trailer"
              placeholder='Nhập link trailer ...'
              value={formData.trailer}
              onChange={handleChange}
              className="w-full p-2 rounded bg-[#111] border border-gray-700"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded flex items-center gap-2 cursor-pointer
              ${loading ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/80'}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </>
              ) : (
                editPhim ? 'Cập nhật' : 'Thêm phim'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default PhimForm;
