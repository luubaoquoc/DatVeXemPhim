import { DatVe, ThanhToan } from '../models/index.js';
import sequelize from '../configs/sequelize.js';
import { Op } from 'sequelize';
import ChiTietDatVe from '../models/ChiTietDatVe.js';


// Xóa vé đang chờ thanh toán đã hết hạn
export const xoaVeDangCho = async () => {
  const now = new Date();
  try {
    const hanDatve = await DatVe.findAll({
      where: {
        trangThai: { [Op.in]: ['Đang chờ', 'Đang thanh toán'] },
        thoiHanThanhToan: { [Op.lt]: now }
      },
    });

    for (const datVe of hanDatve) {
      const t = await sequelize.transaction();
      try {
        await ThanhToan.destroy({ where: { maDatVe: datVe.maDatVe }, transaction: t });
        await ChiTietDatVe.destroy({ where: { maDatVe: datVe.maDatVe }, transaction: t });
        await datVe.destroy({ transaction: t });


        await t.commit();
        console.log(`Xóa vé ${datVe.maDatVe} đã hết hạn.`);
      } catch (error) {
        await t.rollback();
        console.error('Lỗi xóa vé:', error);
      }
    }
  } catch (err) {
    console.error('Lỗi xóa vé:', err);
  }
};