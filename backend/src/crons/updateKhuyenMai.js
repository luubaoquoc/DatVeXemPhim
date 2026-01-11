import { KhuyenMai } from "../models/index.js";
import { Op } from "sequelize";


export const updateTrangThaiKhuyenMai = async () => {
  try {
    const now = new Date();

    // Bật mã khi tới ngày bắt đầu
    await KhuyenMai.update(
      { trangThai: true },
      {
        where: {
          ngayBatDau: { [Op.lte]: now },
          ngayHetHan: { [Op.gte]: now },
        },
      }
    );

    //  Tắt mã khi hết hạn
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