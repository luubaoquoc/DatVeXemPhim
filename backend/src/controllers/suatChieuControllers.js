import { SuatChieu, Phim, PhongChieu, Rap, Ghe } from '../models/index.js';

// GET /api/suatchieu?page=1&limit=20&maPhim=...
export const listSuatChieus = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const where = {};
    if (req.query.maPhim) where.maPhim = Number(req.query.maPhim);

    const { count, rows } = await SuatChieu.findAndCountAll({ where, include: [{ model: Phim, as: 'phim', attributes: ['maPhim', 'tenPhim'] }, { model: PhongChieu, as: 'phongChieu', attributes: ['maPhong', 'tenPhong'] }], limit, offset, order: [['maSuatChieu', 'ASC']] });
    return res.json({ total: count, page, limit, data: rows });
  } catch (error) {
    console.error('listSuatChieus error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// GET /api/suatchieu/dates?maPhim=1
export const getDatesForMovie = async (req, res) => {
  try {
    const maPhim = Number(req.query.maPhim);
    if (!maPhim) return res.status(400).json({ message: 'maPhim là bắt buộc' });

    // distinct dates (only date part)
    const rows = await SuatChieu.findAll({ where: { maPhim }, attributes: ['gioBatDau'] });
    const dates = Array.from(new Set(rows.map(r => r.gioBatDau ? r.gioBatDau.toISOString().slice(0, 10) : null))).filter(Boolean);
    return res.json(dates.sort());
  } catch (error) {
    console.error('getDatesForMovie error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// GET /api/suatchieu/raps?maPhim=1&date=2025-10-22
export const getRapsForMovieDate = async (req, res) => {
  try {
    const maPhim = Number(req.query.maPhim);
    const date = req.query.date;
    if (!maPhim || !date) return res.status(400).json({ message: 'maPhim và date là bắt buộc' });

    const start = new Date(date + 'T00:00:00');
    const end = new Date(date + 'T23:59:59');

    const { Op } = await import('sequelize');
    const rows = await SuatChieu.findAll({ where: { maPhim, gioBatDau: { [Op.between]: [start, end] } }, include: [{ model: PhongChieu, as: 'phongChieu', include: [{ model: Rap, as: 'rap' }] }] });

    // map to structured response: rap, phong, suatChieu list
    const map = {};
    for (const r of rows) {
      const pc = r.phongChieu;
      const rap = pc?.rap;
      if (!rap) continue;
      if (!map[rap.maRap]) map[rap.maRap] = { maRap: rap.maRap, tenRap: rap.tenRap, phongChieus: {} };
      if (!map[rap.maRap].phongChieus[pc.maPhong]) map[rap.maRap].phongChieus[pc.maPhong] = { maPhong: pc.maPhong, tenPhong: pc.tenPhong, suatChieus: [] };
      map[rap.maRap].phongChieus[pc.maPhong].suatChieus.push({ maSuatChieu: r.maSuatChieu, gioBatDau: r.gioBatDau, gioKetThuc: r.gioKetThuc, giaVeCoBan: r.giaVeCoBan });
    }

    const result = Object.values(map).map(r => ({ ...r, phongChieus: Object.values(r.phongChieus) }));
    return res.json(result);
  } catch (error) {
    console.error('getRapsForMovieDate error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};



export const getGheTheoPhong = async (req, res) => {
  try {
    const { maPhong } = req.params;

    const ghe = await Ghe.findAll({
      where: { maPhong },
      order: [
        ['hang', 'ASC'],
        ['soGhe', 'ASC']
      ]
    });

    res.json(ghe);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách ghế" });
  }
};


// GET /api/suatchieu/:maSuatChieu
export const getSuatChieu = async (req, res) => {
  try {
    const ma = Number(req.params.maSuatChieu);
    if (!ma) return res.status(400).json({ message: 'maSuatChieu không hợp lệ' });
    const sc = await SuatChieu.findByPk(ma, {
      include: [
        {
          model: Phim,
          as: 'phim',
          attributes: ['maPhim', 'tenPhim', 'poster']
        },
        {
          model: PhongChieu,
          as: 'phongChieu',
          attributes: ['maPhong', 'tenPhong', 'tongSoGhe', 'maRap'],
          include: [
            {
              model: Rap,
              as: 'rap',
              attributes: ['maRap', 'tenRap', 'diaChi']
            }
          ]
        }
      ]
    });
    if (!sc) return res.status(404).json({ message: 'Suất chiếu không tồn tại' });
    return res.json(sc);
  } catch (error) {
    console.error('getSuatChieu error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// POST /api/suatchieu (admin)
export const createSuatChieu = async (req, res) => {
  try {
    const { maPhim, maPhong, gioBatDau, gioKetThuc, ngonNgu, giaVeCoBan } = req.body;
    if (!maPhim || !maPhong || !gioBatDau) return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    const newSc = await SuatChieu.create({ maPhim, maPhong, gioBatDau, gioKetThuc: gioKetThuc || null, ngonNgu: ngonNgu || null, giaVeCoBan: giaVeCoBan || null });
    return res.status(201).json({ message: 'Tạo suất chiếu thành công', suatChieu: newSc });
  } catch (error) {
    console.error('createSuatChieu error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// PUT /api/suatchieu/:maSuatChieu (admin)
export const updateSuatChieu = async (req, res) => {
  try {
    const ma = Number(req.params.maSuatChieu);
    if (!ma) return res.status(400).json({ message: 'maSuatChieu không hợp lệ' });
    const sc = await SuatChieu.findByPk(ma);
    if (!sc) return res.status(404).json({ message: 'Suất chiếu không tồn tại' });
    await sc.update(req.body);
    return res.json({ message: 'Cập nhật suất chiếu thành công', suatChieu: sc });
  } catch (error) {
    console.error('updateSuatChieu error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

// DELETE /api/suatchieu/:maSuatChieu (admin)
export const deleteSuatChieu = async (req, res) => {
  try {
    const ma = Number(req.params.maSuatChieu);
    if (!ma) return res.status(400).json({ message: 'maSuatChieu không hợp lệ' });
    const sc = await SuatChieu.findByPk(ma);
    if (!sc) return res.status(404).json({ message: 'Suất chiếu không tồn tại' });
    await sc.destroy();
    return res.json({ message: 'Xóa suất chiếu thành công' });
  } catch (error) {
    console.error('deleteSuatChieu error:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};
