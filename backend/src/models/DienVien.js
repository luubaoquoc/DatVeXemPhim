import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';

const DienVien = sequelize.define('DienVien', {
  maDienVien: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tenDienVien: { type: DataTypes.STRING(255), allowNull: false },
  anhDaiDien: { type: DataTypes.STRING(255), allowNull: true },
  tieuSu: { type: DataTypes.TEXT, allowNull: true },
  ngaySinh: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'DIEN_VIEN',
  timestamps: false
});

export default DienVien;
