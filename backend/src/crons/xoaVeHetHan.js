
import { Op } from "sequelize";
import DatVe from "../models/DatVe.js";
import ChiTietDatVe from "../models/ChiTietDatVe.js";


// Xóa vé hết hạn thanh toán cho suất chiếu cụ thể
export const xoaVeHetHan = async (maSuatChieu) => {
  const now = new Date();

  const expiredBookings = await DatVe.findAll({
    where: {
      maSuatChieu,
      trangThai: { [Op.in]: ['Đang chờ', 'Đang thanh toán'] },
      thoiHanThanhToan: { [Op.lte]: now },
    },
    attributes: ['maDatVe'],
  });

  if (!expiredBookings.length) return;

  const maDatVes = expiredBookings.map(v => v.maDatVe);

  await ChiTietDatVe.destroy({
    where: { maDatVe: maDatVes }
  });

  await DatVe.destroy({
    where: { maDatVe: maDatVes }
  });

  console.log(`[AUTO CLEAN] Xóa ${maDatVes.length} vé hết hạn`);
};
