import cloudinary from "../configs/cloudinary.js";
import streamifier from 'streamifier'
import Rap from "../models/Rap.js";
import { Op } from "sequelize";

// Lấy danh sách rạp với phân trang và lọc
export const getRaps = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const offset = (page - 1) * limit;

    const where = search
      ? { tenRap: { [Op.like]: `%${search}%` } }
      : {};

    const { count, rows } = await Rap.findAndCountAll({
      where,
      limit,
      offset,
      order: [["maRap", "ASC"]]
    });

    return res.json({
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy danh sách rạp" });
  }
};

// Lấy thông tin rạp theo mã rạp
export const getRapById = async (req, res) => {
  try {
    const { maRap } = req.params;
    const rap = await Rap.findByPk(maRap);

    if (!rap) return res.status(404).json({ message: "Không tìm thấy rạp" });

    res.json(rap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy thông tin rạp" });
  }
};

// Thêm mới rạp
export const createRap = async (req, res) => {
  try {
    const { tenRap, diaChi, soDienThoai, srcMap } = req.body;

    if (!tenRap)
      return res.status(400).json({ message: "Tên rạp không được để trống" });

    const existingRap = await Rap.findOne({ where: { tenRap } });
    if (existingRap) return res.status(400).json({ message: "Rạp với tên này đã tồn tại" });

    let hinhAnh = null;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'hinhAnh',
            resource_type: 'image',
            width: 1240,
            height: 400,
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
      hinhAnh = result.secure_url;
    }

    const rap = await Rap.create({ tenRap, diaChi, soDienThoai, hinhAnh, srcMap });

    res.json({
      message: "Thêm rạp thành công",
      rap
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi thêm rạp" });
  }
};

// Cập nhật thông tin rạp
export const updateRap = async (req, res) => {
  try {
    const { maRap } = req.params;
    const { tenRap, diaChi, soDienThoai, srcMap } = req.body;

    const rap = await Rap.findByPk(maRap);
    if (!rap) return res.status(404).json({ message: "Không tìm thấy rạp" });

    let hinhAnh = rap.hinhAnh;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'hinhAnh',
            resource_type: 'image',
            width: 1240,
            height: 400,
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
      hinhAnh = result.secure_url;
    }

    await rap.update({
      tenRap,
      diaChi,
      soDienThoai,
      hinhAnh,
      srcMap
    });

    res.json({
      message: "Cập nhật rạp thành công",
      rap
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi cập nhật rạp" });
  }
};

// Xóa rạp
export const deleteRap = async (req, res) => {
  try {
    const { maRap } = req.params;

    const rap = await Rap.findByPk(maRap);
    if (!rap) return res.status(404).json({ message: "Không tìm thấy rạp" });

    await rap.destroy();

    res.json({ message: "Xóa rạp thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi xóa rạp" });
  }
};
