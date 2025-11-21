import React, { useState } from "react";
import { XIcon, Eye, EyeOff } from "lucide-react";

const DoiMatKhau = ({ onClose, onSubmit }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu nhập lại không trùng khớp!");
      return;
    }

    onSubmit({
      oldPassword,
      newPassword,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-black/80 border border-primary p-6 rounded-lg w-full max-w-md shadow-lg relative">

        {/* Close button */}
        <XIcon
          className="absolute top-3 right-3 w-5 h-5 cursor-pointer hover:text-red-500"
          onClick={onClose}
        />

        <h2 className="text-2xl font-semibold mb-4 text-center bg-gradient-to-r from-primary  to-yellow-200 bg-clip-text text-transparent">Đổi mật khẩu</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Old Password */}
          <div>
            <label className="text-sm text-gray-400 ">Mật khẩu hiện tại</label>
            <div className="relative mt-2">
              <input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-primary"
                required
              />
              <div
                className="absolute right-3 top-2 cursor-pointer text-gray-500"
                onClick={() => setShowOld(!showOld)}
              >
                {showOld ? <EyeOff /> : <Eye />}
              </div>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-sm text-gray-400">Mật khẩu mới</label>
            <div className="relative mt-2">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-primary"
                required
              />
              <div
                className="absolute right-3 top-2 cursor-pointer text-gray-500"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff /> : <Eye />}
              </div>
            </div>
          </div>

          {/* Confirm */}
          <div>
            <label className="text-sm text-gray-400">Nhập lại mật khẩu</label>
            <div className="relative mt-2">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-primary"
                required
              />
              <div
                className="absolute right-3 top-2 cursor-pointer text-gray-500"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff /> : <Eye />}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dull transition font-medium cursor-pointer"
          >
            Đổi mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoiMatKhau;
