import React from 'react'
import { HistoryIcon, LogOutIcon, Pencil, UserIcon } from 'lucide-react'
import toast from 'react-hot-toast';
import useApi from '../hooks/useApi';
import { updateAvatar } from '../redux/features/authSlice';
import { Link } from 'react-router-dom'


const ProfileSidebar = ({ user, dispatch, logout }) => {

  const api = useApi(true);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await api.put(`/nguoidung/${user.maTaiKhoan}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Cập nhật ảnh thành công!");
      console.log("Avatar API trả về:", res.data.anhDaiDien);

      dispatch(updateAvatar(res.data.anhDaiDien));
    } catch (err) {
      console.error("uploadAvatar error:", err);
      toast.error("Upload ảnh thất bại");
    }
  };
  return (
    <div className="flex-1 bg-black/30 p-8 flex flex-col shadow-lg">
      {/* Avatar */}
      <div className='w-full flex items-center justify-center'>
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-500 p-[2px]">
          <img
            src={user.anhDaiDien || "https://cdn2.fptshop.com.vn/small/avatar_trang_1_cd729c335b.jpg"}
            className="w-full h-full object-cover rounded-full"
            alt=""
          />

          {/* Overlay Pencil */}
          <div
            className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 
               flex items-center justify-center rounded-full cursor-pointer transition"
            onClick={() => document.getElementById("avatarInput").click()}
          >
            <Pencil className="text-white size-6" />
          </div>

          {/* Hidden input */}
          <input
            type="file"
            accept="image/*"
            id="avatarInput"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>


      {/* Name + Email */}
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold mt-4 text-white">{user.hoTen}</h2>
        <p className="text-gray-400 text-sm">{user.email}</p>

        <button
          onClick={() => dispatch(logout())}
          className="flex items-center gap-2 mt-2 border p-2 rounded-lg text-red-500  hover:opacity-90 transition cursor-pointer"
        >
          <LogOutIcon size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
      <div className='flex flex-col mt-5'>
        <Link to="/trang-ca-nhan" className=" flex items-center gap-2 mb-3 hover:text-primary transition border-b border-primary/20 pb-2">
          <UserIcon size={18} />
          <span>Trang cá nhân</span>
        </Link>
        <Link to="/lich-su-dat-ve" className=" flex items-center gap-2 hover:text-primary transition border-b border-primary/20 pb-2">
          <HistoryIcon size={18} />
          <span>Lịch sử đặt vé</span>
        </Link>
      </div>
    </div>
  )
}

export default ProfileSidebar
