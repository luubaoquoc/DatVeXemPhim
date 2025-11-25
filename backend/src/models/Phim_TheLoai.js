import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';
import Phim from './Phim.js';
import TheLoai from './TheLoai.js';


const Phim_TheLoai = sequelize.define('Phim_TheLoai', {
  maPhim: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Phim,
      key: 'maPhim'
    }
  },
  maTheLoai: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: TheLoai,
      key: 'maTheLoai'
    }
  }
}, {
  tableName: 'PHIM_THE_LOAI',
  timestamps: false
});

export default Phim_TheLoai;

