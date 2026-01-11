import DatVe from "../models/DatVe.js";
import ComBoDoAn from "../models/ComboDoAn.js";
import DonDatVeCombo from "../models/DonDatVeCombo.js";
import cloudinary from '../configs/cloudinary.js';
import streamifier from 'streamifier'
import { Op } from "sequelize";


export const getAllComBoDoAn = async (req, res) => {
  try {
    const combos = await ComBoDoAn.findAll({
      where: { trangThai: "Hoạt động" },
      order: [["gia", "ASC"]],
    });

    res.json(combos);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách combo" });
  }
};


export const getComboByDatVe = async (req, res) => {
  const { maDatVe } = req.params;

  try {
    const combos = await DonDatVeCombo.findAll({
      where: { maDatVe },
      include: [
        {
          model: ComBoDoAn,
          attributes: ["maCombo", "tenCombo", "hinhAnh"],
        },
      ],
    });

    res.json(combos);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy combo của đơn đặt vé" });
  }
};


export const addOrUpdateComboToDatVe = async (req, res) => {
  const { maDatVe } = req.params;
  const { maCombo, soLuong } = req.body;

  try {
    const datVe = await DatVe.findByPk(maDatVe);
    if (!datVe) {
      return res.status(404).json({ message: "Đơn đặt vé không tồn tại" });
    }

    if (datVe.trangThai !== "Đang chờ" && datVe.trangThai !== "Đang thanh toán") {
      return res.status(400).json({ message: "Không thể chỉnh sửa combo" });
    }

    const combo = await ComBoDoAn.findByPk(maCombo);
    if (!combo || combo.trangThai !== "Hoạt động") {
      return res.status(400).json({ message: "Combo không hợp lệ" });
    }

    const existed = await DonDatVeCombo.findOne({
      where: { maDatVe, maCombo },
    });

    // soLuong = 0 => xóa
    if (soLuong === 0) {
      if (existed) await existed.destroy();
      return res.json({ message: "Đã xóa combo khỏi đơn" });
    }

    if (existed) {
      existed.soLuong = soLuong;
      await existed.save();
    } else {
      await DonDatVeCombo.create({
        maDatVe,
        maCombo,
        soLuong,
        giaTaiThoiDiem: combo.gia,
      });
    }

    res.json({ message: "Cập nhật combo thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi cập nhật combo" });
  }
};

export const removeComboFromDatVe = async (req, res) => {
  const { maDatVe, maCombo } = req.params;

  try {
    const combo = await DonDatVeCombo.findOne({
      where: { maDatVe, maCombo },
    });

    if (!combo) {
      return res.status(404).json({ message: "Combo không tồn tại trong đơn" });
    }

    await combo.destroy();
    res.json({ message: "Đã xóa combo" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa combo" });
  }
};

/* ================= GET ALL ================= */
export const getAllCombos = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const trangThai = req.query.trangThai || "";

    const where = {};
    if (trangThai && trangThai !== "Tất cả") {
      where.trangThai = trangThai;
    }
    if (search) {
      where.tenCombo = { [Op.like]: `%${search}%` };
    }

    const { rows, count } = await ComBoDoAn.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
    });


    res.json({
      data: rows,
      currentPage: page,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách combo" });
  }
};

/* ================= GET ONE ================= */
export const getComboById = async (req, res) => {
  try {
    const combo = await ComBoDoAn.findByPk(req.params.maCombo);

    if (!combo) {
      return res.status(404).json({ message: "Không tìm thấy combo" });
    }

    res.json(combo);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy combo" });
  }
};

/* ================= CREATE ================= */
export const createCombo = async (req, res) => {
  try {
    const { tenCombo, moTa, gia, trangThai } = req.body;

    if (!tenCombo || !gia) {
      return res
        .status(400)
        .json({ message: "Tên combo và giá là bắt buộc" });
    }
    console.log(req.file);
    console.log(tenCombo);
    console.log(moTa);
    console.log(gia);
    let hinhAnh = null;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'anhComboDoAn',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              console.error(' Lỗi upload Cloudinary:', error)
              return reject(error)
            }
            resolve(result)
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream)
      });
      hinhAnh = result.secure_url;
    }




    const combo = await ComBoDoAn.create({
      tenCombo,
      moTa,
      gia,
      hinhAnh,
      trangThai: trangThai || "Hoạt động",
    });

    res.status(201).json(combo);
  } catch (err) {
    res.status(500).json({ message: "Tạo combo thất bại" });
  }
};

/* ================= UPDATE ================= */
export const updateCombo = async (req, res) => {
  try {
    const { maCombo } = req.params;
    const { tenCombo, moTa, gia, trangThai } = req.body;

    const combo = await ComBoDoAn.findByPk(maCombo);

    if (!combo) {
      return res.status(404).json({ message: "Combo không tồn tại" });
    }

    let hinhAnh = combo.hinhAnh;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'anhComboDoAn',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              console.error(' Lỗi upload Cloudinary:', error)
              return reject(error)
            }
            resolve(result)
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
      hinhAnh = result.secure_url;
    }

    await combo.update({
      tenCombo,
      moTa,
      gia,
      hinhAnh,
      trangThai,
    });

    res.json(combo);
  } catch (err) {
    res.status(500).json({ message: "Cập nhật combo thất bại" });
  }
};

/* ================= DELETE ================= */
export const deleteCombo = async (req, res) => {
  try {
    const { maCombo } = req.params;

    const combo = await ComBoDoAn.findByPk(maCombo);
    if (!combo) {
      return res.status(404).json({ message: "Combo không tồn tại" });
    }

    await combo.destroy();

    res.json({ message: "Xóa combo thành công" });
  } catch (err) {
    res.status(500).json({ message: "Xóa combo thất bại" });
  }
};