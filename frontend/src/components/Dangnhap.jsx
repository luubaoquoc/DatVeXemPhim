import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login, register } from '../redux/features/authSlice'
import toast from "react-hot-toast";
import OtpModal from "./OtpModal";
import { Eye, EyeOff } from "lucide-react";

const Dangnhap = ({ onClose }) => {
  const dispatch = useDispatch()
  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [err, setErr] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showNew, setShowNew] = useState(false)

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await dispatch(login({ email, matKhau })).unwrap();
        toast.success(res.message);
        const vaitro = res.user.vaiTro;
        console.log(vaitro);

        if ([2, 3, 4].includes(vaitro)) {
          navigate('/admin');
        } else {
          navigate('/');
        }
        onClose();
      } else {
        const res = await dispatch(register({ hoTen, email, matKhau })).unwrap();
        toast.success(res.message);
        setShowOtpModal(true);
      }
    } catch (error) {
      setErr(error || error.message || "Lỗi không xác định");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      {
        !showOtpModal && (
          <div className="bg-black/80 w-[350px] border border-primary rounded-2xl p-6 shadow-xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-700 cursor-pointer"
              onClick={onClose}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold  mb-6 text-center bg-gradient-to-r from-primary via-primary-dull to-yellow-400 bg-clip-text text-transparent">
              {isLogin ? "Đăng Nhập" : "Đăng Ký"}
            </h2>
            {err && <p className="text-red-500 text-sm">{err}</p>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!isLogin && (
                <input
                  type="hoten"
                  placeholder="Họ và tên"
                  className="w-full px-4 py-2 border-b rounded-xl focus:outline-none "
                  value={hoTen}
                  onChange={(e) => setHoTen(e.target.value)}
                />
              )}
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border-b rounded-xl focus:outline-none focus:border-b "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Mật khẩu"
                  className="w-full px-4 py-2 border-b rounded-xl focus:outline-none "
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                />
                <div
                  className="absolute right-3 top-2 cursor-pointer text-gray-500"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff /> : <Eye />}
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-blue-500"
                    />
                    Nhớ mật khẩu
                  </label>
                  <a href="#" className="hover:underline">
                    Quên mật khẩu?
                  </a>
                </div>
              )}


              <button
                type="submit"
                className="bg-primary hover:bg-primary-dull text-white py-2 rounded cursor-pointer"
              >
                {isLogin ? "Đăng nhập" : "Đăng ký"}
              </button>
            </form>

            <div className="mt-4 text-center text-gray-400 text-sm">
              {isLogin ? (
                <span>
                  Bạn chưa có tài khoản?{" "}
                  <button
                    className="text-indigo-400 hover:underline cursor-pointer"
                    onClick={() => setIsLogin(false)}
                  >
                    Đăng ký tại đây
                  </button>
                </span>
              ) : (
                <span>
                  Bạn đã có tài khoản?{" "}
                  <button
                    className="text-indigo-400 hover:underline cursor-pointer"
                    onClick={() => setIsLogin(true)}
                  >
                    Đăng nhập tại đây
                  </button>
                </span>
              )}
            </div>
            <div className="mt-6 text-center text-gray-500 text-sm">
              <p className="text-gray-500 text-sm">------- Hoặc --------</p>
              <div className="flex justify-center gap-4 mt-3">
                <button className="p-2 bg-blue-500 rounded-full hover:bg-blue-700 cursor-pointer">
                  <img src='https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg' alt="Google" className="w-5 h-5" />
                </button>
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer">
                  <img src='https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' alt="Google" className="w-5 h-5" />
                </button>

              </div>
            </div>
          </div>
        )}
      {showOtpModal && (<OtpModal email={email} otp={otp} setOtp={setOtp} setShowOtpModal={setShowOtpModal} setIsLogin={setIsLogin} />)}
    </div >
  );
};

export default Dangnhap;
