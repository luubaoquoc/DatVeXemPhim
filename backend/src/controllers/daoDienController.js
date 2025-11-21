import DaoDien from '../models/DaoDien.js'
import { Op } from "sequelize";

// Lấy tất cả đạo diễn
export const getAllDaoDien = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const offset = (page - 1) * limit;

    const { count, rows } = await DaoDien.findAndCountAll({
      where: {
        tenDaoDien: {
          [Op.like]: `%${search}%`
        }
      },
      order: [["maDaoDien", "DESC"]],
      offset: offset,
      limit: limit,
    });

    return res.json({
      data: rows,
      currentPage: page,
      totalItems: count,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đạo diễn' })
  }
}

// Thêm đạo diễn
export const createDaoDien = async (req, res) => {
  try {
    let { tenDaoDien, tieuSu, ngaySinh } = req.body
    if (!ngaySinh || ngaySinh === "") {
      ngaySinh = null;
    }
    if (!tenDaoDien) return res.status(400).json({ message: 'Thiếu tên đạo diễn' })

    const existingDaoDien = await DaoDien.findOne({ where: { tenDaoDien } });
    if (existingDaoDien) return res.status(400).json({ message: 'Đạo diễn với tên này đã tồn tại' });

    const daoDien = await DaoDien.create({ tenDaoDien, tieuSu, ngaySinh })
    res.status(201).json(daoDien)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi khi thêm đạo diễn' })
  }
}

// Sửa đạo diễn
export const updateDaoDien = async (req, res) => {
  try {
    const { maDaoDien } = req.params
    let { tenDaoDien, tieuSu, ngaySinh } = req.body
    if (!ngaySinh || ngaySinh === "") {
      ngaySinh = null;
    }
    const daoDien = await DaoDien.findByPk(maDaoDien)
    if (!daoDien) return res.status(404).json({ message: 'Không tìm thấy đạo diễn' })
    await daoDien.update({ tenDaoDien, tieuSu, ngaySinh })
    res.json(daoDien)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi khi cập nhật đạo diễn' })
  }
}

// Xóa đạo diễn
export const deleteDaoDien = async (req, res) => {
  try {
    const { maDaoDien } = req.params
    const daoDien = await DaoDien.findByPk(maDaoDien)
    if (!daoDien) return res.status(404).json({ message: 'Không tìm thấy đạo diễn' })
    await daoDien.destroy()
    res.json({ message: 'Đã xóa đạo diễn' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi khi xóa đạo diễn' })
  }
}
