import { DataTypes } from 'sequelize';
import sequelize from '../configs/sequelize.js';

const KhuyenMai = sequelize.define('KhuyenMai', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  maKhuyenMai: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  loaiGiamGia: {
    type: DataTypes.ENUM('PHAN_TRAM', 'TIEN_MAT'),
    allowNull: false
  },
  giaTriGiamGia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  giamToiDa: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  giaTriDonToiThieu: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  soLuotSuDung: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  ngayHetHan: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  trangThai: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'KHUYEN_MAI',
  timestamps: false
});


export default KhuyenMai;