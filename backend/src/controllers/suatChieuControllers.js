import { SuatChieu, Phim, PhongChieu, Rap, Ghe } from '../models/index.js';
import { Op } from 'sequelize';

// GET /api/suatchieu?page=1&limit=20&maPhim=...
export const listSuatChieus = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const search = req.query.search || "";

    const offset = (page - 1) * limit;
    const filterPhong = req.query.maPhong || "";
    const filterDate = req.query.date || "";
    const where = {
      ...(search && { '$phim.tenPhim$': { [Op.like]: `%${search}%` } }),
      ...(filterPhong && { maPhong: filterPhong }),
      ...(filterDate && {
        gioBatDau: {
          [Op.between]: [
            new Date(filterDate + 'T00:00:00'),
            new Date(filterDate + 'T23:59:59')
          ]
        }
      })
    }

    const { count, rows } = await SuatChieu.findAndCountAll(
      {
        where,
        include: [
          {
            model: Phim,
            as: 'phim',
            attributes: ['maPhim', 'tenPhim']
          },
          {
            model: PhongChieu,
            as: 'phongChieu',
            attributes: ['maPhong', 'tenPhong']
          }
        ],
        limit,
        offset,
        order: [['maSuatChieu', 'DESC']]
      });
    return res.json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: rows
    });
  } catch (error) {
    console.error('listSuatChieus error:', error);
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

export const createSuatChieu = async (req, res) => {
  try {
    const body = req.body;

    // Nếu payload là array → xử lý batch create
    if (Array.isArray(body)) {

      // Format datetime
      for (const sc of body) {
        sc.gioBatDau = new Date(sc.gioBatDau);
        sc.gioKetThuc = new Date(sc.gioKetThuc);
      }

      // --- Check trùng giữa các suất trong payload ---
      for (let i = 0; i < body.length; i++) {
        for (let j = i + 1; j < body.length; j++) {
          if (body[i].maPhong === body[j].maPhong) {
            const A = body[i];
            const B = body[j];

            if (A.gioBatDau < B.gioKetThuc && A.gioKetThuc > B.gioBatDau) {
              return res.status(400).json({
                message: `2 suất trong danh sách bị trùng nhau!`,
                slotA: A,
                slotB: B
              });
            }
          }
        }
      }

      // --- Check trùng trong DB ---
      for (const sc of body) {
        const overlaps = await SuatChieu.findOne({
          where: {
            maPhong: sc.maPhong,
            gioBatDau: { [Op.lt]: sc.gioKetThuc },
            gioKetThuc: { [Op.gt]: sc.gioBatDau },
          }
        });

        if (overlaps) {
          return res.status(400).json({
            message: `Suất chiếu bị trùng trong phòng ${sc.maPhong}!`,
            conflict: overlaps
          });
        }
      }

      // Không trùng → tạo batch
      const created = await SuatChieu.bulkCreate(body, { returning: true });

      return res.status(201).json({
        message: 'Tạo nhiều suất chiếu thành công',
        suatChieus: created
      });
    }

    // Xử lý 1 suất (tương tự)
    body.gioBatDau = new Date(body.gioBatDau);
    body.gioKetThuc = new Date(body.gioKetThuc);

    const conflict = await SuatChieu.findOne({
      where: {
        maPhong: body.maPhong,
        gioBatDau: { [Op.lt]: body.gioKetThuc },
        gioKetThuc: { [Op.gt]: body.gioBatDau },
      }
    });

    if (conflict) {
      return res.status(400).json({
        message: 'Suất chiếu bị trùng giờ trong cùng phòng!',
        conflict
      });
    }

    const newSC = await SuatChieu.create(body);
    return res.status(201).json({ message: 'Tạo suất chiếu thành công', suatChieu: newSC });

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
    console.log(req.body);

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
