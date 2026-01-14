
import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';

const VaiTro = sequelize.define('VaiTro', {
  maVaiTro: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  tenVaiTro: { 
    type: DataTypes.STRING(50), 
    allowNull: false, 
    unique: true 
  },
  moTa: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  }
}, {
  tableName: 'VAI_TRO',
  timestamps: false,
});

export default VaiTro;