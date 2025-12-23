import React, { useEffect, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import useApi from "../../hooks/useApi";

const SuatChieuForm = ({ onSubmit, onClose, editItem }) => {
  const api = useApi(true)

  const [formData, setFormData] = useState({
    maPhim: "",
    maPhong: "",
    giaVeCoBan: "",
    thoiLuong: 0,
  });

  const [timeSlots, setTimeSlots] = useState([{ gioBatDau: "", gioKetThuc: "" }]);

  const [phims, setPhims] = useState([]);
  const [phongs, setPhongs] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ==============================
     FETCH PHIM + PHÒNG
  =============================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, pc] = await Promise.all([
          api.get("/phim"),
          api.get("/phongchieu"),
        ]);

        setPhims(p.data.data);
        setPhongs(pc.data.data);
      } catch (err) {
        console.log(err);
        toast.error("Không thể tải dữ liệu!");
      }
    };

    fetchData();
  }, [api]);

  /* ==============================
     EDIT MODE (Load dữ liệu cũ)
  =============================== */
  useEffect(() => {
    if (editItem) {

      const toLocalInput = (dateString) => {
        const d = new Date(dateString);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
      };

      setFormData({
        maPhim: editItem.maPhim,
        maPhong: editItem.maPhong,
        giaVeCoBan: editItem.giaVeCoBan,
        thoiLuong: editItem?.phim?.thoiLuong || 0, // lấy từ include
      });

      setTimeSlots([{
        gioBatDau: toLocalInput(editItem.gioBatDau),
        gioKetThuc: toLocalInput(editItem.gioKetThuc),
      }]);
    }
  }, [editItem]);


  /* ==============================
     HANDLE SELECT PHIM
  =============================== */
  const handleSelectPhim = (selected) => {
    const phim = phims.find((p) => p.maPhim === selected.value);

    setFormData({
      ...formData,
      maPhim: selected.value,
      thoiLuong: phim?.thoiLuong || 0,
    });
  };

  const handleSelectPhong = (selected) => {
    setFormData({ ...formData, maPhong: selected.value });
  };

  /* ==============================
     OPTIONS for react-select
  =============================== */
  const phimOptions = phims.map((p) => ({
    value: p.maPhim,
    label: `${p.maPhim} - ${p.tenPhim}`,
  }));

  const phongOptions = phongs
    .filter(pc => pc.trangThai === "Hoạt động")
    .map(pc => ({
      value: pc.maPhong,
      label: pc.tenPhong,
    }));
  const editPhongOption =
    editItem &&
      phongs.find(p => p.maPhong === editItem.maPhong && p.trangThai === "Bảo trì")
      ? {
        value: editItem.maPhong,
        label: `${editItem.phongChieu?.tenPhong || "Phòng"} (Bảo trì)`
      }
      : null;

  const phongOptionsFinal = editPhongOption
    ? [...phongOptions, editPhongOption]
    : phongOptions;


  /* ==============================
     TÍNH GIỜ KẾT THÚC AN TOÀN
  =============================== */
  const calcEndTime = (start, duration) => {
    if (!start || duration <= 0) return "";
    const d = new Date(start);
    if (isNaN(d)) return "";
    d.setMinutes(d.getMinutes() + duration);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  /* ==============================
     UPDATE SLOT
  =============================== */
  const updateTimeSlot = (index, field, value) => {
    const updated = [...timeSlots];
    updated[index][field] = value;

    if (field === "gioBatDau" && formData.thoiLuong > 0) {
      updated[index].gioKetThuc = calcEndTime(value, formData.thoiLuong);
    }

    setTimeSlots(updated);
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { gioBatDau: "", gioKetThuc: "" }]);
  };

  const removeTimeSlot = (index) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };


  /* ==============================
     SUBMIT
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate
    for (const slot of timeSlots) {
      if (!slot.gioBatDau || !slot.gioKetThuc) {
        toast.error("Vui lòng nhập đầy đủ thời gian!");
        setLoading(false);
        return;
      }

      if (slot.gioKetThuc === "Invalid date") {
        toast.error("Giờ kết thúc không hợp lệ!");
        setLoading(false);
        return;
      }
    }

    try {
      const payloadArray = timeSlots.map((slot) => ({
        maPhim: formData.maPhim,
        maPhong: formData.maPhong,
        gioBatDau: slot.gioBatDau,
        gioKetThuc: slot.gioKetThuc,
        giaVeCoBan: formData.giaVeCoBan,
      }));

      if (editItem) {
        await onSubmit(payloadArray[0]);
      } else {
        await onSubmit(payloadArray);
      }

    } catch (err) {
      console.log(err);
      toast.error("Lỗi khi gửi dữ liệu!");
    } finally {
      setLoading(false);
    }
  };


  /* ==============================
     JSX RETURN
  =============================== */
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 ">
      <div className="bg-black/90 border border-primary p-6 rounded-xl w-[650px] text-white overflow-y-auto max-h-[90vh] no-scrollbar max-md:m-4">

        <h2 className="text-2xl font-semibold mb-4 text-center text-primary">
          {editItem ? "Sửa suất chiếu" : "Thêm suất chiếu mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* PHIM */}
          <div className="flex flex-col gap-1">
            <label className="block mb-1 font-medium text-primary">Phim</label>
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

          {/* PHÒNG */}
          <div className="flex flex-col gap-1">
            <label className="block mb-1 font-medium text-primary">Phòng chiếu</label>
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={phongOptionsFinal}
              value={phongOptionsFinal.find((pc) => pc.value === formData.maPhong) || null}
              onChange={handleSelectPhong}
              placeholder="Chọn phòng..."
              isDisabled={!!editPhongOption}
            />
            {editPhongOption && (
              <p className="text-sm text-red-400 mt-1">
                Phòng này đang bảo trì, không thể đổi phòng cho suất chiếu
              </p>
            )}
          </div>

          {/* KHUNG GIỜ */}
          <div className="space-y-3">
            <label className="block mb-1 font-medium text-primary">Khung giờ suất chiếu</label>

            {timeSlots.map((slot, index) => (
              <div key={index} className="p-3 border border-gray-700 bg-[#111]/60 rounded-lg space-y-2">

                {/* Bắt đầu */}
                <div>
                  <label className="block mb-1 font-medium text-primary">Giờ bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={slot.gioBatDau}
                    onChange={(e) => updateTimeSlot(index, "gioBatDau", e.target.value)}
                    className={`w-full p-2 rounded
                  ${editPhongOption
                        ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-[#111] border-gray-700"}
                  `}

                    required
                  />
                </div>

                {/* Kết thúc */}
                <div>
                  <label className="block mb-1 font-medium text-primary">Giờ kết thúc</label>
                  <input
                    type="datetime-local"
                    value={slot.gioKetThuc}
                    onChange={(e) => updateTimeSlot(index, "gioKetThuc", e.target.value)}
                    className={`w-full p-2 rounded
              ${editPhongOption
                        ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-[#111] border-gray-700"}
              `}
                    required
                  />
                </div>

                {index > 0 && !editPhongOption && (
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Xóa khung giờ
                  </button>
                )}
              </div>
            ))}

            {!editItem && (
              <button
                type="button"
                onClick={addTimeSlot}
                className="px-3 py-1 bg-primary/80 rounded hover:bg-primary/70 text-sm"
              >
                + Thêm khung giờ
              </button>
            )}
          </div>

          {/* GIÁ VÉ */}
          <div>
            <label className="font-medium text-primary">Giá vé</label>
            <input
              type="number"
              name="giaVeCoBan"
              value={formData.giaVeCoBan}
              onChange={(e) => setFormData({ ...formData, giaVeCoBan: e.target.value })}
              className="w-full p-2 rounded bg-[#111] border border-gray-700"
              placeholder="Nhập giá vé..."
            />
          </div>

          {/* BUTTONS */}
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
              ) : editItem ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuatChieuForm;
