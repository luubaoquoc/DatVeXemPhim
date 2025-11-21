import React, { useState } from "react";
import { User, Mail, Calendar, Lock, Phone } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import ProfileSidebar from "../components/ProfileSidebar";
import { updateProfile, logout } from '../redux/features/authSlice'
import DoiMatKhau from "../components/DoiMatKhau";
import useApi from "../hooks/useApi";
import toast from "react-hot-toast";


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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/nguoidung/${user.maTaiKhoan}`, formData);
      toast.success("Cập nhật thông tin thành công");
      dispatch(updateProfile(res.data.user));
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thông tin thất bại");
    }
  };

  const handleChangePassword = async (data) => {
    try {
      await api.put(`/nguoidung/${user.maTaiKhoan}/change-password`, data);
      toast.success("Đổi mật khẩu thành công");
      setShowChangePass(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  return (
    <div className="relative my-40 mb-20 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[60vh]">
      <div className="flex flex-col md:flex-row max-md:px-10">
        {/* LEFT CARD */}
        <div className="flex-1">
          <ProfileSidebar user={user} dispatch={dispatch} logout={logout} />
        </div>

        {/* RIGHT CARD */}
        <div className="flex-2 bg-black/30 p-8 shadow-lg border-l border-primary/20 w-full">
          <h3 className="text-lg font-semibold text-white mb-6">Thông tin tài khoản</h3>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="flex items-center gap-3 text-gray-300 border-b border-gray-700 pb-3">
                <label className="flex items-center gap-1">
                  <User size={18} className="text-primary" />
                  <span className="text-primary">Họ và tên:</span>
                </label>
                <input
                  type="text"
                  name="hoTen"
                  value={formData.hoTen}
                  onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                  className="outline-none"
                />
              </div>

              <div className="flex items-center gap-3 text-gray-300 border-b border-gray-700 pb-3">
                <label className="flex items-center gap-1">
                  <Mail size={18} className="text-primary" />
                  <span className="text-primary">Email:</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="outline-none"
                />
              </div>

              <div className="flex items-center gap-3 text-gray-300 border-b border-gray-700 pb-3">
                <label className="flex items-center gap-1">
                  <Phone size={18} className="text-primary" />
                  <span className="text-primary">Số điện thoại:</span>
                </label>
                <input
                  type="text"
                  name="soDienThoai"
                  value={formData.soDienThoai || ""}
                  onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                  className="outline-none"
                />
              </div>

              <div className="flex items-center gap-1 text-gray-300 border-b border-gray-700 pb-3">
                <Calendar size={18} className="text-primary" />
                <span className="text-primary">Ngày tạo tài khoản: </span>{user.ngayTao}
              </div>

              <button className="mt-8 flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-primary-dull hover:opacity-70 transition cursor-pointer">
                Cập nhật
              </button>
            </div>
          </form>
          {/* Change Password */}
          <button className="flex items-center justify-end w-full gap-2 mt-[-35px] text-primary/50 hover:text-primary cursor-pointer">
            <Lock size={16} />
            <span onClick={() => setShowChangePass(true)} className="font-medium cursor-pointer">Đổi mật khẩu</span>
          </button>
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
