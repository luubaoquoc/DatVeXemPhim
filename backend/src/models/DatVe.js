import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';
import TaiKhoan from './TaiKhoan.js';

const DatVe = sequelize.define('DatVe', {
  maDatVe: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  maTaiKhoanDatVe:
  {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: TaiKhoan,
      key: 'maTaiKhoan'
    }
  },
  maSuatChieu: { type: DataTypes.INTEGER, allowNull: false },
  ngayDat: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  tongTien: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  soGhe: { type: DataTypes.STRING, allowNull: false },
  trangThai: {
    type: DataTypes.ENUM(
      'Đang chờ',
      'Thành công',
      'Thất bại'
    ),
    allowNull: false,
    defaultValue: 'Đang chờ'
  },
  thoiHanThanhToan: { type: DataTypes.DATE, allowNull: true },
  maNhanVienBanVe: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: TaiKhoan,
      key: 'maTaiKhoan'
    }
  }
}, {
  tableName: 'DAT_VE',
  timestamps: false
});

export default DatVe;
