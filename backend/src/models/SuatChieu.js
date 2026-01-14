import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';

const SuatChieu = sequelize.define('SuatChieu', {
  maSuatChieu: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  maPhim: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  maPhong: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  gioBatDau: { 
    type: DataTypes.DATE, 
    allowNull: false 
  },
  gioKetThuc: { 
    type: DataTypes.DATE, 
    allowNull: false 
  },
  giaVeCoBan: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  }
}, {
  tableName: 'SUAT_CHIEU',
  timestamps: false
});

export default SuatChieu;
