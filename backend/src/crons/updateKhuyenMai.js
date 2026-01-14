import { KhuyenMai } from "../models/index.js";
import { Op } from "sequelize";

// Cập nhật trạng thái khuyến mãi theo ngày bắt đầu và ngày hết hạn
export const updateTrangThaiKhuyenMai = async () => {
  try {
    const now = new Date();

    await KhuyenMai.update(
      { trangThai: true },
      {
        where: {
          ngayBatDau: { [Op.lte]: now },
          ngayHetHan: { [Op.gte]: now },
        },
      }
    );

    await KhuyenMai.update(
      { trangThai: false },
      {
        where: {
          ngayHetHan: { [Op.lt]: now },
        },
      }
    );

    console.log(" Cập nhật trạng thái khuyến mãi thành công");

  } catch (error) {
    console.log("Lỗi cập nhật trạng thái khuyến mãi: ", error);

  }
};