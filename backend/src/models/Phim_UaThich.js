import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';
import Phim from './Phim.js';
import TaiKhoan from './TaiKhoan.js';

const Phim_UaThich = sequelize.define('Phim_UaThich', {
  maPhim: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Phim,
      key: 'maPhim'
    }
  },
  maTaiKhoan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: TaiKhoan,
      key: 'maTaiKhoan'
    }
  },
  ngayThich: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'PHIM_UA_THICH',
  timestamps: false
});

export default Phim_UaThich;

