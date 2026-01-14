import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';
import TaiKhoan from './TaiKhoan.js';
import KhuyenMai from './KhuyenMai.js';

const DatVe = sequelize.define('DatVe', {
  maDatVe: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true,
    primaryKey: true 
  },
  maTaiKhoanDatVe:
  {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: TaiKhoan,
      key: 'maTaiKhoan'
    }
  },
  maSuatChieu: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  ngayDat: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  tongTien: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  },
  tongSoGhe: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  trangThai: {
    type: DataTypes.ENUM( 'Đang chờ','Đang thanh toán', 'Thành công', 'Thất bại','Đã check-in' ),
    allowNull: false,
    defaultValue: 'Đang chờ'
  },
  thoiHanThanhToan: { 
    type: DataTypes.DATE, 
    allowNull: true 
  },
  maNhanVienBanVe: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: TaiKhoan,
      key: 'maTaiKhoan'
    }
  },
  maKhuyenMaiId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: KhuyenMai,
      key: 'id'
    }
  }
}, {
  tableName: 'DAT_VE',
  timestamps: false
});

export default DatVe;
