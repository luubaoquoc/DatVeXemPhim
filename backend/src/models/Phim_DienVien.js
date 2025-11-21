import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';

const Phim_DienVien = sequelize.define('Phim_DienVien', {
  maPhim: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  maDienVien: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true }
}, {
  tableName: 'PHIM_DIEN_VIEN',
  timestamps: false
});

export default Phim_DienVien;
