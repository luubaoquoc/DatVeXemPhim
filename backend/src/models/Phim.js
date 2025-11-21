import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';

const Phim = sequelize.define('Phim', {
  maPhim: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
  tenPhim: { type: DataTypes.STRING(255), allowNull: false },
  noiDung: { type: DataTypes.TEXT, allowNull: true },
  thoiLuong: { type: DataTypes.INTEGER, allowNull: true },
  poster: { type: DataTypes.STRING(255), allowNull: true },
  trailer: { type: DataTypes.STRING(255), allowNull: true },
  ngayCongChieu: { type: DataTypes.DATE, allowNull: true },
  trangThaiChieu: {
    type: DataTypes.ENUM('Sắp chiếu', 'Đang chiếu', 'Đã kết thúc'),
    allowNull: false,
    defaultValue: 'Sắp chiếu'
  },
  phanLoai: {
    type: DataTypes.ENUM('P', 'T13', 'T16', 'C18'),
    allowNull: false,
    defaultValue: 'P'
  },
  ngonNgu: { type: DataTypes.STRING(50), allowNull: true },
  phuDe: { type: DataTypes.STRING(50), allowNull: true },
  maDaoDien: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'DAO_DIEN',
      key: 'maDaoDien'
    }
  }
}, {
  tableName: 'PHIM',
  timestamps: false
});

export default Phim;
