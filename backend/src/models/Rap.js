import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';

const Rap = sequelize.define('Rap', {
  maRap: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
  tenRap: { type: DataTypes.STRING(255), allowNull: false },
  diaChi: { type: DataTypes.STRING(255), allowNull: true },
  soDienThoai: { type: DataTypes.STRING(10), allowNull: true }
}, {
  tableName: 'RAP',
  timestamps: false
});

export default Rap;
