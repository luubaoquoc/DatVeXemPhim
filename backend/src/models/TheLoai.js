import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';

const TheLoai = sequelize.define('TheLoai', {
  maTheLoai: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tenTheLoai: { type: DataTypes.STRING(100), allowNull: false },
  moTa: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'THE_LOAI',
  timestamps: false
});

export default TheLoai;
