import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';

const PhongChieu = sequelize.define('PhongChieu', {
  maPhong: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  maRap: { type: DataTypes.INTEGER, allowNull: false },
  tenPhong: { type: DataTypes.STRING(100), allowNull: false },
  tongSoGhe: { type: DataTypes.INTEGER, allowNull: true },
  trangThai: { type: DataTypes.ENUM('Hoạt động', 'Bảo trì'), defaultValue: 'Hoạt động' }
}, {
  tableName: 'PHONG_CHIEU',
  timestamps: false
});

export default PhongChieu;
