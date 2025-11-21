import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';

const Ghe = sequelize.define('Ghe', {
  maGhe: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  maPhong: { type: DataTypes.INTEGER, allowNull: false },
  hang: { type: DataTypes.STRING(8), allowNull: false },
  soGhe: { type: DataTypes.INTEGER, allowNull: false },
  trangThai: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'GHE',
  timestamps: false
});

export default Ghe;
