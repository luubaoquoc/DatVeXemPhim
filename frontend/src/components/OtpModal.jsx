import React, { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import useApi from '../hooks/useApi';

const OtpModal = ({ email, otp, setOtp, setShowOtpModal, otpMode, onVerified }) => {
  const api = useApi()
  const inputsRef = useRef([]);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const processingRef = useRef(false);

  // Khi người dùng nhập vào từng ô
  const handleChange = useCallback((e, index) => {
    // Ngăn xử lý duplicate
    if (processingRef.current) return;
    processingRef.current = true;

    const input = e.target.value;

    // Chỉ cho phép nhập 1 số
    const digit = input.replace(/\D/g, '').slice(-1);

    if (digit) {
      // Tạo mảng OTP mới
      const otpArray = otp.padEnd(6, ' ').split('').slice(0, 6);
      otpArray[index] = digit;

      const newOtp = otpArray.join('').replace(/\s+$/, '');
      setOtp(newOtp);

      // Chuyển sang ô tiếp theo
      if (index < 5) {
        requestAnimationFrame(() => {
          inputsRef.current[index + 1]?.focus();
        });
      }
    }

    // Reset flag sau khi xử lý xong
    setTimeout(() => {
      processingRef.current = false;
    }, 50);
  }, [otp, setOtp]);

  // Xử lý phím Backspace
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const otpArray = otp.split('');
      if (!otp[index] && index > 0) {
        otpArray[index - 1] = '';
        setOtp(otpArray.join(''));
        inputsRef.current[index - 1].focus();
      } else {
        otpArray[index] = '';
        setOtp(otpArray.join(''));
      }
    }
  };

  // Gửi xác thực OTP
  const handleVerify = async () => {
    const trimmedOtp = otp.toString().padEnd(6, '').slice(0, 6);
    if (trimmedOtp.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 số OTP!');
      return;
    }

    try {

      const endpoint = otpMode === 'register' ? '/auth/verify-otp' : '/auth/verify-forgot-otp';
      const res = await api.post(endpoint, { email, otp: trimmedOtp });
      toast.success(res.data.message || 'Xác thực OTP thành công!');
      setShowOtpModal(false);
      onVerified();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mã OTP sai hoặc đã hết hạn!');
    }
  };

  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    if (isResending || timer > 0) return;

    try {
      setIsResending(true);
      await api.post('/auth/resend-otp', { email });
      toast.success('Mã OTP mới đã được gửi đến email của bạn!');
      setOtp(''); // reset input
      startTimer(10); // khóa nút 10s
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi lại mã OTP!');
    } finally {
      setIsResending(false);
    }
  };

  // Hàm đếm ngược
  const startTimer = (seconds) => {
    setTimer(seconds);
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-black/90 p-6 rounded-lg shadow-lg w-80 text-center relative border border-primary">
        {/* Nút đóng */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 cursor-pointer"
          onClick={() => setShowOtpModal(false)}
        >
          ✕
        </button>

        <h3 className="font-semibold text-lg mb-4 text-black">
          Nhập mã xác thực OTP
        </h3>

        {/* 6 ô nhập mã OTP */}
        <div className="flex justify-between mb-4">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={otp[index] || ''}
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-10 h-12 text-center border border-gray-300 rounded text-lg font-semibold text-white focus:border-blue-500 focus:outline-none"
              />
            ))}
        </div>

        {/* Nút xác nhận */}
        <button
          className="bg-primary text-white px-4 py-2 rounded w-full hover:bg-primary/90 cursor-pointer"
          onClick={handleVerify}
        >
          Xác nhận
        </button>

        {/* Link gửi lại mã */}
        <p className="text-sm text-gray-600 mt-3">
          Chưa nhận được mã?{' '}
          <button
            onClick={handleResendOtp}
            className={`text-blue-600 font-medium hover:underline cursor-pointer ${timer > 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={isResending || timer > 0}
          >
            {timer > 0 ? `Gửi lại sau ${timer}s` : 'Gửi lại mã OTP'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default OtpModal;
