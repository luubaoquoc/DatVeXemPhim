import { Phim } from "../models/index.js";
import { Op } from "sequelize";


export const updateTranThaiChieu = async () => {
  try {
    const now = new Date();

    const [rowsUpdated] = await Phim.update(
      { trangThaiChieu: "Đang chiếu" },
      {
        where: {
          trangThaiChieu: "Sắp chiếu",
          ngayCongChieu: { [Op.lte]: now },
        },
      }
    );
    if (rowsUpdated > 0) {
      console.log(`Đã cập nhật trạng thái chiếu cho ${rowsUpdated} phim.`);
    }

  } catch (error) {
    console.log("Lỗi cập nhật trạng thái phim: ", error);

  }
};