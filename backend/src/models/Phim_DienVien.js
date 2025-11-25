import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';
import Phim from './Phim.js';
import DienVien from './DienVien.js';

const Phim_DienVien = sequelize.define('Phim_DienVien', {
  maPhim: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Phim,
      key: 'maPhim'
    },
  },
  maDienVien: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DienVien,
      key: 'maDienVien'
    },
  }
}, {
  tableName: 'PHIM_DIEN_VIEN',
  timestamps: false
});

export default Phim_DienVien;
