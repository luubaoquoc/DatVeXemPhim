import React, { useState } from "react";
import { User, Mail, Calendar, Lock, Phone } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import ProfileSidebar from "../components/ProfileSidebar";
import { updateProfile, logout } from '../redux/features/authSlice'
import DoiMatKhau from "../components/DoiMatKhau";
import useApi from "../hooks/useApi";
import toast from "react-hot-toast";
import BlurCircle from "../components/BlurCircle";

const TrangCaNhan = () => {

  const api = useApi(true)
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    hoTen: user.hoTen || "",
    email: user.email || "",
    anhDaiDien: user.anhDaiDien || "",
    soDienThoai: user.soDienThoai || "",
  });

  const [showChangePass, setShowChangePass] = useState(false);

  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await api.put(`/taikhoan/${user.maTaiKhoan}`, formData);
      toast.success("Cập nhật thông tin thành công");
      dispatch(updateProfile(res.data.user));
      setStatus("success");
    } catch (err) {
      const msg = err.response?.data?.message || "Cập nhật thông tin thất bại";
      toast.error(msg);
      setStatus("error");
    }
  };

  const handleChangePassword = async (data) => {
    setStatus("loading");

    try {
      await api.put(`/taikhoan/${user.maTaiKhoan}/change-password`, data);
      toast.success("Đổi mật khẩu thành công");
      setShowChangePass(false);
      setStatus("success");
    } catch (err) {
      const msg = err.response?.data?.message || "Đổi mật khẩu thất bại";
      toast.error(msg);
      setStatus("error");
    }
  };

  return (
    <div className="relative mt-40 mb-20 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-screen">
      <div className="flex flex-col md:flex-row max-md:px-10">

        {/* LEFT SIDE */}
        <div className="flex-1">
          <ProfileSidebar user={user} dispatch={dispatch} logout={logout} />
        </div>

        <BlurCircle top='100px' left='100px' />
        <BlurCircle bottom='0px' right='400px' />

        {/* RIGHT SIDE */}
        <div className="flex-2 bg-black/30 p-8 shadow-lg border-l border-primary/20 w-full">
          <h3 className="text-lg font-semibold text-white mb-6">Thông tin tài khoản</h3>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">

              {/* Input fields giữ nguyên */}

              <div className="flex items-center gap-3 text-gray-300 border-b border-gray-700 pb-3">
                <label className="flex items-center gap-1">
                  <User size={18} className="text-primary" />
                  <span className="text-primary">Họ và tên:</span>
                </label>
                <input
                  type="text"
                  value={formData.hoTen}
                  onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                  className="outline-none bg-transparent"
                />
              </div>

              <div className="flex items-center gap-3 text-gray-300 border-b border-gray-700 pb-3">
                <label className="flex items-center gap-1">
                  <Mail size={18} className="text-primary" />
                  <span className="text-primary">Email:</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="outline-none bg-transparent"
                />
              </div>

              <div className="flex items-center gap-3 text-gray-300 border-b border-gray-700 pb-3">
                <label className="flex items-center gap-1">
                  <Phone size={18} className="text-primary" />
                  <span className="text-primary">Số điện thoại:</span>
                </label>
                <input
                  type="text"
                  value={formData.soDienThoai}
                  onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                  className="outline-none bg-transparent"
                />
              </div>

              <div className="flex items-center gap-1 text-gray-100 border-b border-gray-700 pb-3">
                <Calendar size={18} className="text-primary/40" />
                <span className="text-primary/40">Ngày tạo tài khoản: </span>{user.ngayTao}
              </div>


              {/* ----------- Submit button + loading ----------- */}
              <button
                disabled={status === "loading"}
                className={`mt-8 flex items-center gap-2 px-4 py-2 rounded-lg 
                  text-white bg-primary-dull transition cursor-pointer
                  ${status === "loading" ? "opacity-50 cursor-not-allowed" : "hover:opacity-70"}`}
              >
                {status === "loading" ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </form>

          {/* Change Password */}
          <div className="w-full flex justify-end mt-[-35px]">
            <button
              disabled={status === "loading"}
              className="flex items-center gap-2 text-primary/50 hover:text-primary cursor-pointer"
              onClick={() => setShowChangePass(true)}
            >
              <Lock size={16} />
              <span className="font-medium">Đổi mật khẩu</span>
            </button>
          </div>


        </div>
      </div>

      {showChangePass && (
        <DoiMatKhau
          onClose={() => setShowChangePass(false)}
          onSubmit={handleChangePassword}
        />
      )}
    </div>
  );
};

export default TrangCaNhan;
