import { DatVe, ThanhToan } from '../models/index.js';
import { Op } from 'sequelize';

export const xoaVeDangCho = async () => {
  const now = new Date();
  try {
    // Lấy các vé hết hạn
    const hanDatve = await DatVe.findAll({
      where: {
        trangThai: 'Đang chờ',
        thoiHanThanhToan: { [Op.lt]: now }
      }
    });

    for (const datVe of hanDatve) {
      await ThanhToan.destroy({ where: { maDatVe: datVe.maDatVe } });
      await datVe.destroy();
      console.log(`Xóa vé ${datVe.maDatVe} đã hết hạn.`);
    }
    console.log('Cleanup vé hết hạn hoàn tất.');
  } catch (err) {
    console.error('Lỗi xóa vé:', err);
  }
};
