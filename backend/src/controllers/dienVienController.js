import cloudinary from '../configs/cloudinary.js';
import streamifier from 'streamifier'
import DienVien from '../models/DienVien.js'
import { Op } from "sequelize";


export const getAllDienVien = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const offset = (page - 1) * limit;

    const { count, rows } = await DienVien.findAndCountAll({
      where: {
        tenDienVien: {
          [Op.like]: `%${search}%`
        }
      },
      order: [["maDienVien", "DESC"]],
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
    res.status(500).json({ message: 'Lỗi khi lấy danh sách diễn viên' })
  }
}

export const createDienVien = async (req, res) => {
  try {
    let { tenDienVien, ngaySinh, tieuSu } = req.body
    if (!tenDienVien) return res.status(400).json({ message: 'Thiếu tên diễn viên' })

    const existingDienVien = await DienVien.findOne({ where: { tenDienVien } });
    if (existingDienVien) return res.status(400).json({ message: 'Diễn viên với tên này đã tồn tại' });

    if (!ngaySinh || ngaySinh === "") {
      ngaySinh = null;
    }

    let anhDaiDien = null;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'anhDienVien',
            resource_type: 'image',
            width: 48,
            height: 48,
            crop: "fill",
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
      anhDaiDien = result.secure_url;
    }
    const dienVien = await DienVien.create({ tenDienVien, ngaySinh, tieuSu, anhDaiDien })
    res.status(201).json(dienVien)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm diễn viên' })
  }
}

export const updateDienVien = async (req, res) => {
  try {
    const { maDienVien } = req.params
    let { tenDienVien, ngaySinh, tieuSu } = req.body
    if (!ngaySinh || ngaySinh === "") {
      ngaySinh = null;
    }
    const dienVien = await DienVien.findByPk(maDienVien)
    if (!dienVien) return res.status(404).json({ message: 'Không tìm thấy diễn viên' })

    let anhDaiDien = null;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'anhDienVien',
            resource_type: 'image',
            width: 48,
            height: 48,
            crop: "fill",
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        )
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
      anhDaiDien = result.secure_url;
    }
    await dienVien.update({ tenDienVien, ngaySinh, tieuSu, anhDaiDien })
    res.json(dienVien)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật diễn viên' })
  }
}

export const deleteDienVien = async (req, res) => {
  try {
    const { maDienVien } = req.params
    const dienVien = await DienVien.findByPk(maDienVien)
    if (!dienVien) return res.status(404).json({ message: 'Không tìm thấy diễn viên' })
    await dienVien.destroy()
    res.json({ message: 'Đã xóa diễn viên' })
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa diễn viên' })
  }
}
