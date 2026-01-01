import TheLoai from '../models/TheLoai.js'
import { Op } from "sequelize";


// Lấy tất cả thể loại với phân trang và lọc
export const getAllTheLoai = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const offset = (page - 1) * limit;
    const where = search
      ? { tenTheLoai: { [Op.like]: `%${search}%` } }
      : {};

    const { count, rows } = await TheLoai.findAndCountAll({
      where,
      limit: limit,
      offset: offset,
      order: [["maTheLoai", "DESC"]],
    });

    return res.json({
      data: rows,
      currentPage: page,
      totalItems: count,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách thể loại' })
  }
}


// Thêm thể loại
export const createTheLoai = async (req, res) => {
  try {
    const { tenTheLoai, moTa } = req.body

    if (!tenTheLoai) return res.status(400).json({ message: 'Thiếu tên thể loại' })

    const existingTheLoai = await TheLoai.findOne({ where: { tenTheLoai } });
    if (existingTheLoai) return res.status(400).json({ message: 'Thể loại với tên này đã tồn tại' });
    const theLoai = await TheLoai.create({ tenTheLoai, moTa })
    res.status(201).json(theLoai)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm thể loại' })
  }
}

// Cập nhật thể loại
export const updateTheLoai = async (req, res) => {
  try {
    const { maTheLoai } = req.params
    const { tenTheLoai, moTa } = req.body
    const theLoai = await TheLoai.findByPk(maTheLoai)
    if (!theLoai) return res.status(404).json({ message: 'Không tìm thấy thể loại' })
    await theLoai.update({ tenTheLoai, moTa })
    res.json(theLoai)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật thể loại' })
  }
}

// Xóa thể loại
export const deleteTheLoai = async (req, res) => {
  try {
    const { maTheLoai } = req.params
    const theLoai = await TheLoai.findByPk(maTheLoai)
    if (!theLoai) return res.status(404).json({ message: 'Không tìm thấy thể loại' })
    await theLoai.destroy()
    res.json({ message: 'Đã xóa thể loại' })
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa thể loại' })
  }
}
