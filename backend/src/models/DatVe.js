import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';

const DatVe = sequelize.define('DatVe', {
  maDatVe: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  maTaiKhoanDatVe:
  {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'TAI_KHOAN',
      key: 'maTaiKhoan'
    }
  },
  maSuatChieu: { type: DataTypes.INTEGER, allowNull: false },
  ngayDat: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  tongTien: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  // store selected seat labels (e.g. "A1,A2") as a comma-separated string
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
      model: 'TAI_KHOAN',
      key: 'maTaiKhoan'
    }
  }
}, {
  tableName: 'DAT_VE',
  timestamps: false
});

export default DatVe;
