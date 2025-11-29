import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';
import DatVe from './DatVe.js';
import Ghe from './Ghe.js';

const ChiTietDatVe = sequelize.define('ChiTietDatVe', {
  maChiTiet: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  maDatVe: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DatVe,
      key: 'maDatVe'
    },
    onDelete: 'CASCADE'
  },

  maGhe: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Ghe,
      key: 'maGhe'
    }
  },

  giaVe: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  trangThai: {
    type: DataTypes.ENUM('Đã giữ', 'Đã thanh toán', 'Thất bại'),
    defaultValue: 'Đã giữ'
  }

}, {
  tableName: 'CHI_TIET_DAT_VE',
  timestamps: false
});

export default ChiTietDatVe;
