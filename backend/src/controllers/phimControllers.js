import { Op } from 'sequelize';
import { Phim, DanhGia, TheLoai, DienVien, DaoDien, TaiKhoan, Phim_UaThich } from '../models/index.js';
import cloudinary from '../configs/cloudinary.js';
import streamifier from 'streamifier'


// GET /api/phim?page=1&limit=20&q=keyword

export const listPhims = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const offset = (page - 1) * limit;
    const whereOp = search ? { tenPhim: { [Op.like]: `%${search}%` } } : {};

    // Tổng số phim
    const totalItems = await Phim.count({ where: whereOp });

    // Lấy phim với join optional
    const rows = await Phim.findAll({
      where: whereOp,
      include: [
        { model: DaoDien, as: 'daoDien', attributes: ['tenDaoDien'], required: false },
        { model: TheLoai, as: 'theLoais', attributes: ['maTheLoai', 'tenTheLoai'], through: { attributes: [] }, required: false },
        { model: DienVien, as: 'dienViens', attributes: ['maDienVien', 'tenDienVien'], through: { attributes: [] }, required: false },
        { model: DanhGia, as: 'danhGias', attributes: ['diem'], separate: true, order: [['ngayDanhGia', 'DESC']], required: false },
      ],
      limit,
      offset,
      order: [['ngayCongChieu', 'DESC']],
    });

    const data = rows.map(phim => {
      const plainPhim = phim.get({ plain: true });
      const danhGias = plainPhim.danhGias || [];
      plainPhim.rating = danhGias.length
        ? (danhGias.reduce((sum, dg) => sum + parseFloat(dg.diem || 0), 0) / danhGias.length).toFixed(1)
        : null;
      return plainPhim;
    });

    return res.json({
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      data,
    });
  } catch (error) {
    console.error('listPhims error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};


// GET /api/phim/:maPhim
export const getPhim = async (req, res) => {
  try {
    const phim = await Phim.findByPk(req.params.maPhim, {
      include: [
        { model: DaoDien, as: 'daoDien', attributes: ['maDaoDien', 'tenDaoDien'], required: false },
        { model: TheLoai, as: 'theLoais', attributes: ['maTheLoai', 'tenTheLoai'], through: { attributes: [] }, required: false },
        { model: DienVien, as: 'dienViens', attributes: ['maDienVien', 'tenDienVien'], through: { attributes: [] }, required: false },
        { model: DanhGia, as: 'danhGias', attributes: ['diem'], separate: true, order: [['ngayDanhGia', 'DESC']], required: false },
      ]
    });

    if (!phim) return res.status(404).json({ message: 'Không tìm thấy phim' });

    const plainPhim = phim.get({ plain: true });
    const danhGias = plainPhim.danhGias || [];
    plainPhim.rating = danhGias.length
      ? (danhGias.reduce((sum, dg) => sum + parseFloat(dg.diem || 0), 0) / danhGias.length).toFixed(1)
      : null;

    res.json(plainPhim);


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ================== TẠO PHIM MỚI ==================
export const createPhim = async (req, res) => {
  try {
    let {
      tenPhim,
      moTa,
      thoiLuong,
      ngayCongChieu,
      maDaoDien,
      maTheLoai,
      maDienVien,
      trailer,
      trangThaiChieu,
      phanLoai,
      ngonNgu,
      phuDe
    } = req.body

    console.log(req.file)

    // Parse JSON nếu frontend gửi chuỗi
    try {
      if (typeof maTheLoai === 'string') maTheLoai = JSON.parse(maTheLoai)
      if (typeof maDienVien === 'string') maDienVien = JSON.parse(maDienVien)
    } catch (e) {
      console.error('JSON parse error:', e)
    }

    let posterUrl = null

    const phim = await Phim.findOne({ where: { tenPhim } });
    if (phim) {
      return res.status(400).json({ message: 'Phim với tên này đã tồn tại' });
    }

    //  Upload ảnh lên Cloudinary (nếu có)
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'posters',
            resource_type: 'image',
            width: 500,
            height: 750,
            crop: "fill",
            timeout: 120000 // 2 phút
          },
          (error, result) => {
            if (error) {
              console.error(' Lỗi upload Cloudinary:', error)
              return reject(error)
            }
            resolve(result)
          }
        )

        // Dùng streamifier để tạo stream an toàn từ buffer
        streamifier.createReadStream(req.file.buffer).pipe(stream)
      })

      posterUrl = result.secure_url
    }

    //  Tạo phim mới
    const newPhim = await Phim.create({
      tenPhim,
      noiDung: moTa,
      thoiLuong: thoiLuong || null,
      ngayCongChieu: ngayCongChieu || null,
      maDaoDien: maDaoDien || null,
      poster: posterUrl,
      trailer: trailer || null,
      trangThaiChieu: trangThaiChieu || 'Sắp chiếu',
      phanLoai: phanLoai || 'P',
      ngonNgu: ngonNgu || null,
      phuDe: phuDe || null
    })

    //  Liên kết thể loại & diễn viên (N-N)
    if (maTheLoai?.length) await newPhim.setTheLoais(maTheLoai)
    if (maDienVien?.length) await newPhim.setDienViens(maDienVien)

    res.status(201).json({ message: ' Thêm phim thành công', phim: newPhim })
  } catch (err) {
    console.error(' Lỗi khi thêm phim:', err)
    res.status(500).json({ message: 'Lỗi server khi thêm phim' })
  }
}

// ================== CẬP NHẬT PHIM ==================
export const updatePhim = async (req, res) => {
  try {
    const { maPhim } = req.params
    const phim = await Phim.findByPk(maPhim)
    if (!phim) return res.status(404).json({ message: 'Phim không tồn tại' })

    let {
      tenPhim,
      moTa,
      thoiLuong,
      ngayCongChieu,
      maDaoDien,
      maTheLoai,
      maDienVien,
      trailer,
      trangThaiChieu,
      phanLoai,
      ngonNgu,
      phuDe
    } = req.body

    try {
      if (typeof maTheLoai === 'string') maTheLoai = JSON.parse(maTheLoai)
      if (typeof maDienVien === 'string') maDienVien = JSON.parse(maDienVien)
    } catch (e) {
      console.error(' JSON parse error:', e)
    }

    let posterUrl = phim.poster

    //  Nếu có ảnh mới thì upload lại
    if (req.file) {
      const uploadStream = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'posters',
              resource_type: 'image',
              timeout: 1200
            },
            (error, result) => {
              if (error) return reject(error)
              resolve(result)
            }
          )
          stream.end(req.file.buffer)
        })

      const result = await uploadStream()
      posterUrl = result.secure_url
    }

    //  Cập nhật thông tin phim
    await phim.update({
      tenPhim,
      noiDung: moTa,
      thoiLuong,
      ngayCongChieu,
      maDaoDien,
      trailer,
      poster: posterUrl,
      trangThaiChieu,
      phanLoai,
      ngonNgu,
      phuDe
    })

    //  Cập nhật liên kết
    if (maTheLoai) await phim.setTheLoais(maTheLoai)
    if (maDienVien) await phim.setDienViens(maDienVien)

    res.json({ message: ' Cập nhật phim thành công', phim })
  } catch (err) {
    console.error(' Lỗi khi cập nhật phim:', err)
    res.status(500).json({ message: 'Lỗi server khi cập nhật phim' })
  }
}

// ================== XÓA PHIM ==================
export const deletePhim = async (req, res) => {
  try {
    const { maPhim } = req.params;
    const phim = await Phim.findByPk(maPhim);
    if (!phim) return res.status(404).json({ message: 'Phim không tồn tại' });

    await phim.destroy();
    res.json({ message: 'Xóa phim thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi xóa phim' });
  }
};

// POST /api/phim/:maPhim/like  - like a movie
export const likePhim = async (req, res) => {
  try {
    const maPhim = parseInt(req.params.maPhim);
    const maTaiKhoan = req.user?.maTaiKhoan;
    if (!maTaiKhoan) return res.status(401).json({ message: 'Unauthorized' });

    const phim = await Phim.findByPk(maPhim);
    if (!phim) return res.status(404).json({ message: 'Phim không tồn tại' });

    const exists = await Phim_UaThich.findOne({ where: { maPhim, maTaiKhoan } });
    if (exists) return res.status(400).json({ message: 'Đã thích phim này' });

    await Phim_UaThich.create({ maPhim, maTaiKhoan });
    return res.json({ message: 'Thích phim thành công' });
  } catch (err) {
    console.error('likePhim error:', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// DELETE /api/phim/:maPhim/like  - unlike a movie
export const unlikePhim = async (req, res) => {
  try {
    const maPhim = parseInt(req.params.maPhim);
    const maTaiKhoan = req.user?.maTaiKhoan;
    if (!maTaiKhoan) return res.status(401).json({ message: 'Unauthorized' });

    const record = await Phim_UaThich.findOne({ where: { maPhim, maTaiKhoan } });
    if (!record) return res.status(404).json({ message: 'Chưa thích phim này' });

    await record.destroy();
    return res.json({ message: 'Bỏ thích phim thành công' });
  } catch (err) {
    console.error('unlikePhim error:', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// GET /api/phim/liked  - get current user's liked movies
export const getLikedPhims = async (req, res) => {
  try {
    const maTaiKhoan = req.user?.maTaiKhoan;
    if (!maTaiKhoan) return res.status(401).json({ message: 'Unauthorized' });

    const user = await TaiKhoan.findByPk(maTaiKhoan, {
      include: [
        {
          model: Phim,
          as: 'likedPhims',
          through: { attributes: ['ngayThich'] },
          include: [
            {
              model: TheLoai,
              as: 'theLoais',
              through: { attributes: [] }
            }
          ]
        }]
    });
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });

    // trả về danh sách phim
    return res.json({ data: user.likedPhims || [] });
  } catch (err) {
    console.error('getLikedPhims error:', err);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy đánh giá của user cho phim (nếu có)
export const getUserDanhGia = async (req, res) => {
  try {
    const maPhim = parseInt(req.params.maPhim);
    const maTaiKhoan = req.user?.maTaiKhoan;
    if (!maTaiKhoan) return res.status(401).json({ message: 'Unauthorized' });
    const danhGia = await DanhGia.findOne({ where: { maPhim, maTaiKhoan } });
    if (!danhGia) return res.status(404).json({ message: 'Chưa đánh giá phim này' });
    res.json({ data: danhGia });
  } catch (err) {
    console.error('getUserDanhGia error:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy đánh giá' });
  }
};

// Đánh giá phim
export const danhGiaPhim = async (req, res) => {
  try {
    const maPhim = parseInt(req.params.maPhim);
    const maTaiKhoan = req.user?.maTaiKhoan;
    const { diem } = req.body;
    if (!maTaiKhoan) return res.status(401).json({ message: 'Unauthorized' });

    const phim = await Phim.findByPk(maPhim);
    if (!phim) return res.status(404).json({ message: 'Phim không tồn tại' });
    if (diem < 1 || diem > 10) {
      return res.status(400).json({ message: 'Điểm đánh giá phải từ 1 đến 10' });
    }
    const [danhGia, created] = await DanhGia.findOrCreate({
      where: { maPhim, maTaiKhoan },
      defaults: { diem }
    });
    if (!created) {
      danhGia.diem = diem;
      await danhGia.save();
    }

    res.json({ message: created ? 'Đánh giá thành công' : 'Cập nhật đánh giá thành công', data: danhGia });
  } catch (err) {
    console.error('danhGiaPhim error:', err);
    res.status(500).json({ message: 'Lỗi server khi đánh giá phim' });
  }
}