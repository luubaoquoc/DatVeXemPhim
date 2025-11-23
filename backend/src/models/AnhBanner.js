import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';

const AnhBanner = sequelize.define('AnhBanner', {
  maAnhBanner: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  anh: { type: DataTypes.STRING(255), allowNull: false }
}, {
  tableName: 'ANH_BANNER',
  timestamps: false
});

export default AnhBanner;
