import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';

const DaoDien = sequelize.define('DaoDien', {
  maDaoDien: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  tenDaoDien: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  anhDaiDien: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  tieuSu: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  ngaySinh: { 
    type: DataTypes.DATE, 
    allowNull: true 
  }
}, {
  tableName: 'DAO_DIEN',
  timestamps: false
});

export default DaoDien;
