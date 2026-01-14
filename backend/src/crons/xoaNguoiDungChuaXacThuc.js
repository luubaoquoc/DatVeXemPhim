import { TaiKhoan } from "../models/index.js";
import { Op } from "sequelize";


// Xóa người dùng chưa xác thực sau 24 giờ
export const xoaNguoiDungChuaXacThuc = async () => {
  try {
    const now = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const deleted = await TaiKhoan.destroy({
      where: {
        emailXacThuc: false,
        ngayTao: { [Op.lt]: now },
      },
    });

    if (deleted > 0) {
      console.log(`Đã xóa ${deleted} tài khoản chưa xác thực.`);
    }
    console.log('Cleanup tài khoản chưa xác thực hoàn tất.');
  } catch (error) {
    console.error("Lỗi xóa người dùng chưa xác thực:", error);
  }
};
