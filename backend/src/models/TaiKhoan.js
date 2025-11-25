import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';
import VaiTro from './VaiTro.js';
import Rap from './Rap.js';

const TaiKhoan = sequelize.define('TaiKhoan', {
  maTaiKhoan: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },

  hoTen: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  matKhau: { type: DataTypes.STRING, allowNull: false },
  soDienThoai: { type: DataTypes.STRING(10), allowNull: true },
  ngayTao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
  emailXacThuc: { type: DataTypes.BOOLEAN, defaultValue: false },
  otpMa: { type: DataTypes.STRING(6), allowNull: true },
  otpHetHan: { type: DataTypes.DATE, allowNull: true },
  anhDaiDien: { type: DataTypes.STRING, defaultValue: null, allowNull: true },

  maVaiTro: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    references: {
      model: VaiTro,
      key: 'maVaiTro'
    }

  },

  maRap: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Rap,
      key: 'maRap'
    }
  }
}, {
  tableName: 'TAI_KHOAN',
  timestamps: false,
});

export default TaiKhoan;