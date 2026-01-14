import ChiTietDatVe from "../models/ChiTietDatVe.js";
import DatVe from "../models/DatVe.js";
import Ghe from "../models/Ghe.js";
import { Op } from "sequelize";
import SuatChieu from "../models/SuatChieu.js";

// Lấy danh sách ghế theo phòng
export const listGheByPhong = async (req, res) => {
  try {
    const { maPhong } = req.query;
    if (!maPhong) return res.status(400).json({ message: "Phòng không hợp lệ" });

    const ghe = await Ghe.findAll({
      where: { maPhong },
      order: [["hang", "ASC"], ["soGhe", "ASC"]],
      attributes: ["maGhe", "maPhong", "hang", "soGhe", "trangThai"]
    });

    return res.json(ghe);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Cập nhật trạng thái ghế
export const updateGhe = async (req, res) => {
  try {
    const { maGhe } = req.params;
    const { trangThai, force } = req.body;
    const ghe = await Ghe.findByPk(maGhe);
    if (!ghe) return res.status(404).json({ message: "Không tìm thấy ghế" });

    if(trangThai === false && !force ) {
      const getDaDat = await ChiTietDatVe.findOne({
        where: {
          maGhe: maGhe,
        },
        include: [
          {
            model: DatVe,
            as: 'datVe',
            required: true,
            include: [
              {
                model: SuatChieu,
                as: 'suatChieu',
                required: true,
                where: {
                  maPhong: ghe.maPhong,
                  gioBatDau: { [Op.gt]: new Date() } 
                }
              }
            ],
          }
        ],
      });
      if (getDaDat) {
        return res.status(400).json({ 
          message: "Ghế đã được đặt cho suất chiếu tương lai.",
          needConfirm: true
        }
        );
      }
    }

    ghe.trangThai = trangThai;
    await ghe.save();
    return res.json({ message: "Cập nhật thành công", ghe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};


