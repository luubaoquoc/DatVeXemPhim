
import TaiKhoan from './TaiKhoan.js';
import VaiTro from './VaiTro.js';
import Phim from './Phim.js';
import TheLoai from './TheLoai.js';
import Phim_TheLoai from './Phim_TheLoai.js';
import DaoDien from './DaoDien.js';
import DienVien from './DienVien.js';
import Phim_DienVien from './Phim_DienVien.js';
import DanhGia from './DanhGia.js';
import DatVe from './DatVe.js';
import ThanhToan from './ThanhToan.js';
import SuatChieu from './SuatChieu.js';
import Rap from './Rap.js';
import PhongChieu from './PhongChieu.js';
import Ghe from './Ghe.js';
import Phim_UaThich from './Phim_UaThich.js';
import ChiTietDatVe from './ChiTietDatVe.js';
import LichSuDungMa from './LichSuDungMa.js';
import KhuyenMai from './KhuyenMai.js';


// --- THIẾT LẬP MỐI QUAN HỆ ---

// VaiTro <-> TaiKhoan (1 - N)
VaiTro.hasMany(TaiKhoan, { foreignKey: 'maVaiTro', as: 'taiKhoans', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
TaiKhoan.belongsTo(VaiTro, { foreignKey: 'maVaiTro', as: 'vaiTro', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

Rap.hasMany(TaiKhoan, { foreignKey: 'maRap', as: 'taiKhoansThuocRap', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
TaiKhoan.belongsTo(Rap, { foreignKey: 'maRap', as: 'rapLamViec', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// Phim <-> DienVien (N - M) via Phim_DienVien
Phim.belongsToMany(DienVien, { through: Phim_DienVien, foreignKey: 'maPhim', otherKey: 'maDienVien', as: 'dienViens' });
DienVien.belongsToMany(Phim, { through: Phim_DienVien, foreignKey: 'maDienVien', otherKey: 'maPhim', as: 'phims' });

// DaoDien -> Phim (1 - N)
// PHIM.maDaoDien references DAO_DIEN.maDaoDien
DaoDien.hasMany(Phim, { foreignKey: 'maDaoDien', as: 'phims' });
Phim.belongsTo(DaoDien, { foreignKey: 'maDaoDien', as: 'daoDien' });

// Phim <-> TheLoai (N - M) via Phim_TheLoai
Phim.belongsToMany(TheLoai, { through: Phim_TheLoai, foreignKey: 'maPhim', otherKey: 'maTheLoai', as: 'theLoais' });
TheLoai.belongsToMany(Phim, { through: Phim_TheLoai, foreignKey: 'maTheLoai', otherKey: 'maPhim', as: 'phims' });

// Phim <-> TaiKhoan (N - M) via Phim_UaThich (liked movies)
Phim.belongsToMany(TaiKhoan, { through: Phim_UaThich, foreignKey: 'maPhim', otherKey: 'maTaiKhoan', as: 'likedBy' });
TaiKhoan.belongsToMany(Phim, { through: Phim_UaThich, foreignKey: 'maTaiKhoan', otherKey: 'maPhim', as: 'likedPhims' });

// DanhGia relations
TaiKhoan.hasMany(DanhGia, { foreignKey: 'maTaiKhoan', as: 'danhGias' });
DanhGia.belongsTo(TaiKhoan, { foreignKey: 'maTaiKhoan', as: 'taiKhoan' });
Phim.hasMany(DanhGia, { foreignKey: 'maPhim', as: 'danhGias' });
DanhGia.belongsTo(Phim, { foreignKey: 'maPhim', as: 'phim' });

// Rap -> PhongChieu
Rap.hasMany(PhongChieu, { foreignKey: 'maRap', as: 'phongChieus' });
PhongChieu.belongsTo(Rap, { foreignKey: 'maRap', as: 'rap' });
// PhongChieu -> Ghe (1 - N)
PhongChieu.hasMany(Ghe, { foreignKey: 'maPhong', as: 'ghes' });
Ghe.belongsTo(PhongChieu, { foreignKey: 'maPhong', as: 'phongChieu' });

// Phim -> SuatChieu -> DatVe -> ChiTietDatVe
Phim.hasMany(SuatChieu, { foreignKey: 'maPhim', as: 'suatChieus' });
SuatChieu.belongsTo(Phim, { foreignKey: 'maPhim', as: 'phim' });
PhongChieu.hasMany(SuatChieu, { foreignKey: 'maPhong', as: 'suatChieus' });
SuatChieu.belongsTo(PhongChieu, { foreignKey: 'maPhong', as: 'phongChieu' });

SuatChieu.hasMany(DatVe, { foreignKey: 'maSuatChieu', as: 'datVes' });
DatVe.belongsTo(SuatChieu, { foreignKey: 'maSuatChieu', as: 'suatChieu' });

// DatVe now stores both the customer and (optionally) the staff who sold the
// ticket using maTaiKhoanDatVe and maNhanVienBanVe. Create two associations
// so you can eager-load either the customer or the staff member.
TaiKhoan.hasMany(DatVe, { foreignKey: 'maTaiKhoanDatVe', as: 'datVes' });
DatVe.belongsTo(TaiKhoan, { foreignKey: 'maTaiKhoanDatVe', as: 'khachHang' });



// Optional: association for the staff who sold the ticket
TaiKhoan.hasMany(DatVe, { foreignKey: 'maNhanVienBanVe', as: 'datVeBan' });
DatVe.belongsTo(TaiKhoan, { foreignKey: 'maNhanVienBanVe', as: 'nhanVien' });

DatVe.hasMany(ChiTietDatVe, { foreignKey: 'maDatVe', as: 'chiTietDatVes', onDelete: 'CASCADE' });
ChiTietDatVe.belongsTo(DatVe, { foreignKey: 'maDatVe', as: 'datVe' });

Ghe.hasMany(ChiTietDatVe, { foreignKey: 'maGhe', as: 'chiTietDatVes', onDelete: 'CASCADE' });
ChiTietDatVe.belongsTo(Ghe, { foreignKey: 'maGhe', as: 'ghe' });
// Previously DatVe had ChiTietDatVe entries linking to Ghe; now seat labels are stored
// directly on DatVe.soGhe (comma-separated list). No ChiTietDatVe or Ghe associations.

LichSuDungMa.belongsTo(TaiKhoan, { foreignKey: 'maTaiKhoan', as: 'taiKhoan' });
TaiKhoan.hasMany(LichSuDungMa, { foreignKey: 'maTaiKhoan', as: 'lichSuDungMas' });

LichSuDungMa.belongsTo(KhuyenMai, { foreignKey: 'maKhuyenMaiId', as: 'khuyenMai' });
KhuyenMai.hasMany(LichSuDungMa, { foreignKey: 'maKhuyenMaiId', as: 'lichSuDungMas' });

DatVe.belongsTo(KhuyenMai, { foreignKey: 'maKhuyenMaiId', as: 'khuyenMai' });
KhuyenMai.hasMany(DatVe, { foreignKey: 'maKhuyenMaiId', as: 'datVes' });

DatVe.hasOne(ThanhToan, { foreignKey: 'maDatVe', as: 'thanhToan', onDelete: 'CASCADE' });
ThanhToan.belongsTo(DatVe, { foreignKey: 'maDatVe', as: 'datVe' });

// Xuất các models
export {
  TaiKhoan,
  VaiTro,
  Phim,
  TheLoai,
  Phim_TheLoai,
  DaoDien,
  DienVien,
  Phim_DienVien,
  DanhGia,
  DatVe,
  ThanhToan,
  SuatChieu,
  Rap,
  PhongChieu,
  Ghe,
  Phim_UaThich,
  ChiTietDatVe,
  LichSuDungMa,
  KhuyenMai
};