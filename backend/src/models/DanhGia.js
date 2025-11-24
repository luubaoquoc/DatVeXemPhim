import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';

const DanhGia = sequelize.define('DanhGia', {
  maDanhGia: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
  maTaiKhoan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'TAI_KHOAN',
      key: 'maTaiKhoan'
    }
  },
  maPhim: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'PHIM',
      key: 'maPhim'
    }
  },
  diem: { type: DataTypes.DECIMAL(3, 1), allowNull: false },
  ngayDanhGia: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'DANH_GIA',
  timestamps: false
});

export default DanhGia;
