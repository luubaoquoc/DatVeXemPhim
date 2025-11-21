import { Op } from 'sequelize';
import { Phim, DanhGia, TheLoai, DienVien, DaoDien } from '../models/index.js';
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
        { model: DienVien, as: 'dienViens', attributes: ['maDienVien', 'tenDienVien'], through: { attributes: [] }, required: false }
      ]
    });

    if (!phim) return res.status(404).json({ message: 'Không tìm thấy phim' });
    res.json(phim);
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