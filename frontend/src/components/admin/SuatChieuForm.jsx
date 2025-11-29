import React, { useEffect, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import useApi from "../../hooks/useApi";

const SuatChieuForm = ({ onSubmit, onClose, editItem }) => {
  const api = useApi(true)

  const [formData, setFormData] = useState({
    maPhim: "",
    maPhong: "",
    gioBatDau: "",
    gioKetThuc: "",
    giaVeCoBan: "",
  });
  const [timeSlots, setTimeSlots] = useState([
    { gioBatDau: "", gioKetThuc: "" }
  ])
  const [phims, setPhims] = useState([])
  const [phongs, setPhongs] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch phim + phòng
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, pc] = await Promise.all([
          api.get("/phim"),
          api.get("/phongchieu"),
        ]);

        setPhims(p.data.data);
        setPhongs(pc.data.items);
      } catch (err) {
        console.log(err);
        toast.error("Không thể tải dữ liệu!");
      }
    };

    fetchData();
  }, [api]);

  // Nếu đang sửa
  useEffect(() => {
    if (editItem) {
      setFormData({
        maPhim: editItem.maPhim,
        maPhong: editItem.maPhong,
        giaVeCoBan: editItem.giaVeCoBan,
      });

      const toLocalInput = (dateString) => {
        const d = new Date(dateString);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
      };

      setTimeSlots([
        {
          gioBatDau: toLocalInput(editItem.gioBatDau),
          gioKetThuc: toLocalInput(editItem.gioKetThuc),
        },
      ]);

    }
  }, [editItem]);


  // Handle change input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  // Handle selects
  const handleSelectPhim = (selected) => {
    setFormData({ ...formData, maPhim: selected.value });
  };

  const handleSelectPhong = (selected) => {
    setFormData({ ...formData, maPhong: selected.value });
  };


  // Options cho react-select
  const phimOptions = phims.map((p) => ({
    value: p.maPhim,
    label: `${p.maPhim} - ${p.tenPhim}`,
  }));

  const phongOptions = phongs.map((pc) => ({
    value: pc.maPhong,
    label: pc.tenPhong,
  }));


  const updateTimeSlot = (index, field, value) => {
    const updated = [...timeSlots];
    updated[index][field] = value;
    setTimeSlots(updated);
  };
  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { gioBatDau: "", gioKetThuc: "" }]);
  };

  const removeTimeSlot = (index) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };



  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Tạo danh sách suất chiếu
      const payloadArray = timeSlots.map((slot) => ({
        maPhim: formData.maPhim,
        maPhong: formData.maPhong,
        gioBatDau: slot.gioBatDau,
        gioKetThuc: slot.gioKetThuc,
        giaVeCoBan: formData.giaVeCoBan,
      }));

      if (editItem) {
        // nếu đang sửa -> chỉ gửi object để update 1 suất
        await onSubmit(payloadArray[0]);
      } else {
        // thêm nhiều suất -> gửi mảng
        await onSubmit(payloadArray);
      }
    } catch (err) {
      console.log(err);
      toast.error("Lỗi khi gửi dữ liệu!");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 ">
      <div className="bg-black/90 border border-primary p-6 rounded-xl w-[650px] text-white overflow-y-auto max-h-[90vh] no-scrollbar">

        <h2 className="text-2xl font-semibold mb-4 text-center bg-gradient-to-r from-primary to-yellow-200 bg-clip-text text-transparent">
          {editItem ? "Sửa suất chiếu" : "Thêm suất chiếu mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Chọn phim */}
          <div className="flex flex-col gap-1">
            <label className="font-medium">Phim</label>
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={phimOptions}
              value={phimOptions.find((p) => p.value === formData.maPhim) || null}
              onChange={handleSelectPhim}
              placeholder="Chọn phim..."
              isSearchable
            />
          </div>

          {/* Chọn phòng */}
          <div className="flex flex-col gap-1">
            <label className="font-medium">Phòng chiếu</label>
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={phongOptions}
              value={phongOptions.find((pc) => pc.value === formData.maPhong) || null}
              onChange={handleSelectPhong}
              placeholder="Chọn phòng..."
              isSearchable
            />
          </div>

          {/* Nhiều khung giờ suất chiếu */}
          <div className="space-y-3">
            <label className="font-medium">Khung giờ suất chiếu</label>

            {timeSlots.map((slot, index) => (
              <div
                key={index}
                className="p-3 border border-gray-700 bg-[#111]/60 rounded-lg space-y-2"
              >
                {/* Giờ bắt đầu */}
                <div>
                  <label>Giờ bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={slot.gioBatDau}
                    onChange={(e) =>
                      updateTimeSlot(index, "gioBatDau", e.target.value)
                    }
                    className="w-full p-2 rounded bg-[#111] border border-gray-700"
                    required
                  />
                </div>

                {/* Giờ kết thúc */}
                <div>
                  <label>Giờ kết thúc</label>
                  <input
                    type="datetime-local"
                    value={slot.gioKetThuc}
                    onChange={(e) =>
                      updateTimeSlot(index, "gioKetThuc", e.target.value)
                    }
                    className="w-full p-2 rounded bg-[#111] border border-gray-700"
                  />
                </div>

                {/* Nút xóa */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(index)}
                    className="text-red-400 hover:text-red-300 text-sm cursor-pointer"
                  >
                    Xóa khung giờ
                  </button>
                )}
              </div>
            ))}

            {/* Nút thêm khung giờ */}
            {!editItem && (
              <button
                type="button"
                onClick={addTimeSlot}
                className="px-3 py-1 bg-primary/80 rounded hover:bg-primary/70 text-sm cursor-pointer"
              >
                + Thêm khung giờ
              </button>)}
          </div>


          {/* Giá vé */}
          <div>
            <label>Giá vé </label>
            <input
              type="number"
              name="giaVeCoBan"
              value={formData.giaVeCoBan}
              onChange={handleChange}
              className="w-full p-2 rounded bg-[#111] border border-gray-700"
              placeholder="Nhập giá vé..."
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
                ${loading ? "bg-primary/50 cursor-not-allowed" : "bg-primary hover:bg-primary/80"}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </>
              ) : editItem ? (
                "Cập nhật"
              ) : (
                "Thêm mới"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuatChieuForm;
