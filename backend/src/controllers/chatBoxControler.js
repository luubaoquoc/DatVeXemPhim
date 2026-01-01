

import Groq from "groq-sdk";
import Phim from "../models/Phim.js";
import TheLoai from "../models/TheLoai.js";
import SuatChieu from "../models/SuatChieu.js";
import DanhGia from "../models/DanhGia.js";
import sequelize from "../configs/sequelize.js";
import PhongChieu from "../models/PhongChieu.js";
import Rap from "../models/Rap.js";
import KhuyenMai from "../models/KhuyenMai.js";
import { Op } from "sequelize";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const chatWithAI = async (req, res) => {
  const { message } = req.body;

  try {
    // Lấy phim đang chiếu
    const movies = await Phim.findAll({
      where: { trangThaiChieu: "Đang chiếu" },
      include: [
        {
          model: TheLoai,
          as: "theLoais",
          attributes: ["tenTheLoai"],
          through: { attributes: [] }
        },
        {
          model: SuatChieu,
          as: "suatChieus",
          attributes: ["gioBatDau"],
          where: sequelize.where(
            sequelize.fn("DATE", sequelize.col("gioBatDau")),
            sequelize.fn("CURDATE")
          ),
          include: [
            {
              model: PhongChieu,
              as: "phongChieu",
              attributes: ["tenPhong", "maRap"],
              include: [
                {
                  model: Rap,
                  as: "rap",
                  attributes: ["tenRap"]
                }
              ]
            }
          ],
          required: false
        },
        {
          model: DanhGia,
          as: "danhGias",
          attributes: ["diem"],
          required: false
        }
      ]
    });

    const khuyenMais = await KhuyenMai.findAll({
      where: {
        trangThai: true,
        ngayHetHan: {
          [Op.gte]: new Date()
        }
      }
    });


    // Chuẩn hóa dữ liệu cho AI
    const movieContext = movies.map(m => ({
      tenPhim: m.tenPhim,
      theLoai: m.theLoais.map(t => t.tenTheLoai).join(", "),
      suatChieu: m.suatChieus.map(s => s.gioBatDau),
      diemTB:
        m.danhGias.length > 0
          ? (
            m.danhGias.reduce((a, b) => a + Number(b.diem), 0) /
            m.danhGias.length
          ).toFixed(1)
          : "Chưa có",
      rapChieu: [...new Set(m.suatChieus.map(s => s.phongChieu.rap.tenRap))].join(", ")
    }));

    const promotionContext = khuyenMais.map(km => ({
      maKhuyenMai: km.maKhuyenMai,

      loaiGiamGia:
        km.loaiGiamGia === "PHAN_TRAM"
          ? `Giảm ${km.giaTriGiamGia}%`
          : `Giảm ${km.giaTriGiamGia?.toLocaleString()}đ`,

      giamToiDa: km.giamToiDa
        ? `${km.giamToiDa.toLocaleString()}đ`
        : "Không giới hạn",

      donToiThieu: km.giaTriDonToiThieu
        ? `${km.giaTriDonToiThieu.toLocaleString()}đ`
        : "Không yêu cầu",

      hetHan: km.ngayHetHan
        ? new Date(km.ngayHetHan).toISOString().split("T")[0]
        : "Không xác định"
    }));


    //  Prompt
    const prompt = `
    Bạn là trợ lý đặt vé xem phim.

    Dữ liệu phim hôm nay:
    ${JSON.stringify(movieContext, null, 2)}

     Khuyến mãi hiện có:
    ${promotionContext.length > 0
        ? JSON.stringify(promotionContext, null, 2)
        : "Hiện không có khuyến mãi nào"}

    Câu hỏi người dùng:
    "${message}"

    YÊU CẦU:
    - Trả lời bằng tiếng Việt
    - Ngắn gọn, rõ ràng
    - Chỉ sử dụng dữ liệu đã cung cấp
    - Nếu hỏi về khuyến mãi thì trả lời từ phần Khuyến mãi hiện có
    - Không được bịa mã giảm giá
    - Nếu không có thì nói rõ
    `;

    // Gọi Groq
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Bạn là chatbot hỗ trợ đặt vé xem phim." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi chatbot AI" });
  }
};

