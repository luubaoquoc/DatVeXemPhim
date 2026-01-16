import TaiKhoan from "../models/TaiKhoan.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/sendEmail.js";

const createAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: "1h" });
};

const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};


export const register = async (req, res) => {
  try {
    const { hoTen, email, matKhau } = req.body;

    if (!hoTen || !email || !matKhau) return res.status(400).json({ message: "Vui lòng nhập tất cả các trường!" });

    const existing = await TaiKhoan.findOne({ where: { email } });
    if (existing) {
      if (existing.emailXacThuc === false) {
        const newOtp = Math.floor(100000 + Math.random() * 900000);
        const otpHetHan = Date.now() + 5 * 60 * 1000;

        await existing.update({ otpMa: newOtp, otpHetHan });
        await sendVerificationEmail({
          to: email,
          subject: "Mã xác thực tài khoản Go Cinema",
          html: `
            <h2>Chào mừng bạn đến với Go Cinema</h2>
            <p>Mã xác thực của bạn là:</p>
            <h1 style="color: #4F46E5;">${newOtp}</h1>
            <p>Mã có hiệu lực trong 5 phút.</p>
         `,
        });

        return res.json({
          message: "Tài khoản đã tồn tại nhưng chưa xác thực. Mã OTP mới đã được gửi đến email của bạn.",
          maTaiKhoan: existing.maTaiKhoan
        });
      }

      return res.status(400).json({ message: "Tài khoản với email này đã tồn tại!" });
    }

    const hashMatkhau = await bcrypt.hash(matKhau, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);

    const newTaiKhoan = await TaiKhoan.create({
      hoTen: hoTen,
      email,
      matKhau: hashMatkhau,
      emailXacThuc: false,
      otpMa: otp,
      otpHetHan: Date.now() + 5 * 60 * 1000
    });

    await sendVerificationEmail({
      to: email,
      subject: "Mã xác thực tài khoản Go Cinema",
      html: `
        <h2>Chào mừng bạn đến với Go Cinema</h2>
        <p>Mã xác thực của bạn là:</p>
        <h1 style="color: #4F46E5;">${otp}</h1>
        <p>Mã có hiệu lực trong 5 phút.</p>
      `
    });
    return res.status(201).json({
      message: "Đăng ký thành công! Vui lòng kiểm tra email để nhận mã xác thực.",
      maTaiKhoan: newTaiKhoan.maTaiKhoan
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return res.status(500).json({ message: "Lỗi Server" });
  }
}



export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Thiếu thông tin xác thực." });

    const user = await TaiKhoan.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản." });

    if (user.emailXacThuc)
      return res.status(400).json({ message: "Tài khoản đã xác thực." });

    if (user.otpHetHan < new Date())
      return res.status(400).json({ message: "Mã OTP đã hết hạn." });

    if (user.otpMa != otp)
      return res.status(400).json({ message: "Mã OTP không đúng." });

    await user.update({
      emailXacThuc: true,
      otpMa: null,
      otpHetHan: null
    });

    return res.json({ message: "Xác thực thành công! Bạn có thể đăng nhập." });
  } catch (error) {
    console.error("Lỗi verifyOtp:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Vui lòng nhập email." });

    const user = await TaiKhoan.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản." });

    if (user.emailXacThuc)
      return res.status(400).json({ message: "Tài khoản đã được xác thực." });


    const newOtp = Math.floor(100000 + Math.random() * 900000);
    const newExpiry = Date.now() + 5 * 60 * 1000;

    await user.update({
      otpMa: newOtp,
      otpHetHan: newExpiry,
    });

    await sendVerificationEmail({
      to: email,
      subject: "Gửi lại mã xác thực tài khoản Go Cinema",
      html: `
        <h2>Xin chào ${user.hoTen}</h2>
        <p>Đây là mã xác thực mới của bạn:</p>
        <h1 style="color: #4F46E5;">${newOtp}</h1>
        <p>Mã có hiệu lực trong 5 phút.</p>
      `,
    });

    return res.status(200).json({ message: "Đã gửi lại mã OTP qua email." });
  } catch (error) {
    console.error("Lỗi resendOtp:", error);
    return res.status(500).json({ message: "Lỗi server." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, matKhau } = req.body;

    if (!email || !matKhau) return res.status(400).json({ message: "Vui lòng nhập tất cả các trường!" });

    const user = await TaiKhoan.findOne({ where: { email } });

    if (!user) return res.status(400).json({ message: "Tài khoản không tồn tại!" });

    if (!user.emailXacThuc) return res.status(403).json({ message: "Tài khoản chưa xác thực. Vui lòng kiểm tra email." });

    const isMatchMatkhau = await bcrypt.compare(matKhau, user.matKhau);
    if (!isMatchMatkhau) return res.status(400).json({ message: "Mật khẩu hoặc Email không chính xác!" });

    if (user.khoaTaiKhoan) return res.status(403).json({ message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên." });

    const payload = { maTaiKhoan: user.maTaiKhoan };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);


    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    });

    const userData = {
      maTaiKhoan: user.maTaiKhoan,
      hoTen: user.hoTen,
      email: user.email,
      soDienThoai: user.soDienThoai,
      ngayTao: user.ngayTao,
      anhDaiDien: user.anhDaiDien,
      maRap: user.maRap,
      vaiTro: user.maVaiTro
    };
    res.status(200).json({
      message: "Đăng nhập thành công",
      accessToken,
      user: userData
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Lỗi Server" });
  }

}


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await TaiKhoan.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expire = new Date(Date.now() + 5 * 60 * 1000);

    await user.update({
      otpMa: otp,
      otpHetHan: expire,
    });

    await sendVerificationEmail({
      to: email,
      subject: "OTP đặt lại mật khẩu",
      html: `<p>Mã OTP của bạn là: <b>${otp}</b></p>`
    });

    return res.json({ message: "OTP đã được gửi về email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await TaiKhoan.findOne({ where: { email } });
  if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

  if (
    user.otpMa !== otp ||
    new Date(user.otpHetHan) < new Date()
  ) {
    return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
  }

  return res.json({ message: "OTP hợp lệ" });
};

// POST /auth/reset-password
export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await TaiKhoan.findOne({ where: { email } });
  if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

  const hashed = await bcrypt.hash(newPassword, 10);

  await user.update({
    matKhau: hashed,
    otpMa: null,
    otpHetHan: null,
  });

  return res.json({ message: "Đổi mật khẩu thành công" });
};



export const logout = (req, res) => {
  res.clearCookie("refreshToken", { path: "/" });
  res.json({ message: "Đăng xuất thành công" });
}


export const refreshToken = (req, res) => {
  try {
    const rfToken = req.cookies?.refreshToken;

    if (!rfToken) return res.status(401).json({ message: "Chưa có refresh token." });

    jwt.verify(rfToken, process.env.JWT_REFRESH_SECRET, async (error, decoded) => {
      if (error) return res.status(403).json({ message: "Refresh token không hợp lệ." });

      const user = await TaiKhoan.findByPk(decoded.maTaiKhoan);
      if (!user) return res.status(404).json({ message: "Tài khoản không tồn tại." });

      const payload = { maTaiKhoan: user.maTaiKhoan };
      const accessToken = createAccessToken(payload);

      const userData = {
        maTaiKhoan: user.maTaiKhoan,
        hoTen: user.hoTen,
        email: user.email,
        soDienThoai: user.soDienThoai,
        ngayTao: user.ngayTao,
        anhDaiDien: user.anhDaiDien,
        maRap: user.maRap,
        vaiTro: user.maVaiTro
      };
      return res.status(200).json({ accessToken, user: userData });
    });
  } catch (error) {
    console.error("Refresh error:", error.message);
    res.status(500).json({ message: "Lỗi server khi refresh token" });
  }
}