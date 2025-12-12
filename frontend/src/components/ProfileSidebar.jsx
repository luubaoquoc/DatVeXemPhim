import React from 'react';
import { Heart, HistoryIcon, LogOutIcon, Pencil, UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import useApi from '../hooks/useApi';
import { updateAvatar } from '../redux/features/authSlice';
import { Link, useLocation } from 'react-router-dom';

const ProfileSidebar = ({ user, dispatch, logout }) => {
  const api = useApi(true);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // =================== HANDLE AVATAR ===================
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await api.put(
        `/taikhoan/${user.maTaiKhoan}/avatar`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Cập nhật ảnh thành công!");
      dispatch(updateAvatar(res.data.anhDaiDien));

    } catch (err) {
      console.error("uploadAvatar error:", err);
      toast.error("Upload ảnh thất bại");
    }
  };

  // =================== MENU LIST ===================
  const menuItems = [
    { icon: <UserIcon size={18} />, label: "Trang cá nhân", path: "/trang-ca-nhan" },
    { icon: <HistoryIcon size={18} />, label: "Lịch sử đặt vé", path: "/lich-su-dat-ve" },
    { icon: <Heart size={18} />, label: "Phim ưa thích", path: "/phim-ua-thich" },
  ];

  return (
    <div className="flex-1 bg-black/30 p-8 flex flex-col shadow-lg">

      {/* ================= AVATAR ================= */}
      <div className="w-full flex items-center justify-center">
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-500 p-[2px]">

          <img
            src={user.anhDaiDien || "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg"}
            className="w-full h-full object-cover rounded-full"
            alt=""
          />

          {/* Overlay Edit */}
          <div
            className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100
              flex items-center justify-center rounded-full cursor-pointer transition"
            onClick={() => document.getElementById("avatarInput").click()}
          >
            <Pencil className="text-white size-6" />
          </div>

          {/* Hidden Input */}
          <input
            type="file"
            accept="image/*"
            id="avatarInput"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* ================= USER INFO ================= */}
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold mt-4 text-white">{user.hoTen}</h2>
        <p className="text-gray-400 text-sm">{user.email}</p>

        <button
          onClick={() => dispatch(logout())}
          className="flex items-center gap-2 mt-2 border p-2 rounded-lg text-red-500 hover:opacity-90 transition cursor-pointer"
        >
          <LogOutIcon size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>

      {/* ================= MENU LIST ================= */}
      <div className="flex flex-col mt-5 gap-y-3">

        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className={`flex items-center gap-2 border-b border-primary/20 pb-2 transition 
              ${isActive(item.path) ? "text-primary" : "text-white hover:text-primary"}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}

      </div>
    </div>
  );
};

export default ProfileSidebar;
