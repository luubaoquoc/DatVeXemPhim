import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';

const ThanhToan = sequelize.define('ThanhToan', {
  maThanhToan: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  maDatVe: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  phuongThuc: { 
    type: DataTypes.STRING(50), 
    allowNull: true 
  },
  soTien: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  },
  ngayThanhToan: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  trangThai: {
    type: DataTypes.ENUM(
      'Chờ xử lý',
      'Thành công',
      'Thất bại'
    ),
    allowNull: false,
    defaultValue: 'Chờ xử lý'
  },
}, {
  tableName: 'THANH_TOAN',
  timestamps: false
});

export default ThanhToan;
