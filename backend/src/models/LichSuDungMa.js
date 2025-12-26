import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';

const LichSuDungMa = sequelize.define('LichSuDungMa', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  maTaiKhoan: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maKhuyenMaiId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ngaySuDung: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'LICH_SU_DUNG_MA',
  timestamps: false
});

export default LichSuDungMa;