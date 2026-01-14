

import Groq from "groq-sdk";
import Phim from "../models/Phim.js";
import TheLoai from "../models/TheLoai.js";
import SuatChieu from "../models/SuatChieu.js";
import DanhGia from "../models/DanhGia.js";
import sequelize from "../configs/sequelize.js";
import PhongChieu from "../models/PhongChieu.js";
import Rap from "../models/Rap.js";
import KhuyenMai from "../models/KhuyenMai.js";
import { QueryTypes, Op, fn, col, literal } from "sequelize";
import DatVe from "../models/DatVe.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


// Chat với AI
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
          attributes: ["gioBatDau", "giaVeCoBan"],
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
        ngayBatDau: {
          [Op.lte]: new Date()
        },
        ngayHetHan: {
          [Op.gte]: new Date()
        }
      }
    });

    const rap = await Rap.findAll();


    // Chuẩn hóa dữ liệu cho AI
    const movieContext = movies.map(m => ({
      tenPhim: m.tenPhim,
      poster: m.poster,
      theLoai: m.theLoais.map(t => t.tenTheLoai).join(", "),
      suatChieu: m.suatChieus.map(s => ({
        gioBatDau: s.gioBatDau,
        giaVeCoBan: s.giaVeCoBan.toLocaleString(),
        phongChieu: s.phongChieu.tenPhong,
        rapChieu: s.phongChieu.rap.tenRap
      })),
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

      ngayBatDau: km.ngayBatDau
        ? new Date(km.ngayBatDau).toISOString().split("T")[0]
        : "Không xác định",

      hetHan: km.ngayHetHan
        ? new Date(km.ngayHetHan).toISOString().split("T")[0]
        : "Không xác định"
    }));

    const rapContext = rap.map(r => ({
      tenRap: r.tenRap,
      diaChi: r.diaChi,
      soDienThoai: r.soDienThoai
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

    Dữ liệu rạp chiếu:
    ${JSON.stringify(rapContext, null, 2)}

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




// Gợi ý phim cá nhân hóa
export const getRecommendedMovies = async (req, res) => {
  try {

    console.log("Người dùng từ xác thực:", req.user);

    if (!req.user) {
      return await fallbackMovies(res);
    }



    const maTaiKhoan = req.user.maTaiKhoan;
    console.log("maTaiKhoan:", maTaiKhoan);


    const favoriteGenres = await sequelize.query(
      `
      SELECT tl.maTheLoai, COUNT(*) AS movieCount
      FROM DAT_VE dv
      JOIN SUAT_CHIEU sc ON dv.maSuatChieu = sc.maSuatChieu
      JOIN PHIM p ON sc.maPhim = p.maPhim
      JOIN PHIM_THE_LOAI pt ON p.maPhim = pt.maPhim
      JOIN THE_LOAI tl ON pt.maTheLoai = tl.maTheLoai
      WHERE dv.maTaiKhoanDatVe = :maTaiKhoan
      GROUP BY tl.maTheLoai
      ORDER BY movieCount DESC
      LIMIT 3
      `,
      {
        replacements: { maTaiKhoan },
        type: QueryTypes.SELECT
      }
    );

    if (!favoriteGenres.length) {
      return await fallbackMovies(res);
    }

    const genreIds = favoriteGenres.map(g => g.maTheLoai);


    const movies = await Phim.findAll({
      where: { trangThaiChieu: "Đang chiếu" },
      include: [
        {
          model: TheLoai,
          as: "theLoais",
          where: { maTheLoai: genreIds },
          through: { attributes: [] }
        },
        {
          model: DanhGia,
          as: "danhGias",
          attributes: ["diem"],
          required: false
        },
        {
          model: SuatChieu,
          as: "suatChieus",
          required: true
        }
      ],
      order: [
        ["ngayCongChieu", "DESC"]
      ],
      limit: 8
    });


    const data = movies.map(phim => {
      const avgRating =
        phim.danhGias.length > 0
          ? (
            phim.danhGias.reduce(
              (sum, dg) => sum + Number(dg.diem),
              0
            ) / phim.danhGias.length
          ).toFixed(1)
          : "0.0";

      return {
        ...phim.toJSON(),
        rating: avgRating
      };
    });

    return res.json({
      type: "personalized",
      movies: data
    });

  } catch (err) {
    console.error("AI Recommendation error:", err);
    res.status(500).json({ message: "Lỗi gợi ý phim" });
  }
};


const fallbackMovies = async (res) => {
  const hotMovies = await Phim.findAll({
    where: { trangThaiChieu: "Đang chiếu" },
    attributes: {
      include: [[fn("AVG", col("danhGias.diem")), "rating"]]
    },
    include: [
      {
        model: DanhGia,
        as: "danhGias",
        attributes: [],
        required: false
      }
    ],
    group: ["Phim.maPhim"],
    order: [
      [literal("rating"), "DESC"],
      ["ngayCongChieu", "DESC"]
    ],
    limit: 4,
    subQuery: false,
    raw: true
  });

  const movies = await Phim.findAll({
    where: { maPhim: hotMovies.map(m => m.maPhim) },
    include: [
      { model: TheLoai, as: "theLoais", through: { attributes: [] } }
    ]
  });

  const ratingMap = {};
  const orderMap = {};

  hotMovies.forEach((m, i) => {
    ratingMap[m.maPhim] = m.rating ? Number(m.rating).toFixed(1) : "0.0";
    orderMap[m.maPhim] = i;
  });

  const data = movies
    .map(p => ({
      ...p.toJSON(),
      rating: ratingMap[p.maPhim] || "0.0"
    }))
    .sort((a, b) => orderMap[a.maPhim] - orderMap[b.maPhim]);

  return res.json({
    type: "fallback",
    movies: data
  });
};


// Phân tích doanh thu với AI
export const analyzeRevenueAI = async (req, res) => {
  try {
    const { chartData, topPhim, filterType, maRap } = req.body;

    const doanhThuText = chartData
      .map(d => `- ${d.label || d.ngay}: ${d.tong}`)
      .join("\n");

    const topPhimText = topPhim?.length
      ? topPhim.map(p =>
        `- ${p.tenPhim}: ${p.soVe} vé, ${Number(p.doanhThu).toLocaleString()} VNĐ`
      ).join("\n")
      : "Không có dữ liệu";

    const prompt = `
    Bạn là trợ lý AI cho quản trị viên hệ thống rạp chiếu phim.

    Dữ liệu doanh thu (${filterType}) ${maRap ? `của rạp ${maRap}` : "toàn hệ thống"}:

      DOANH THU (${filterType}):
${doanhThuText}

 TOP PHIM:
${topPhimText}

    Yêu cầu:
1. Nhận xét xu hướng doanh thu
2. Nhận xét top phim bán chạy
3. Đề xuất hành động cho admin
Ngắn gọn – rõ ràng – tiếng Việt.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Bạn là chuyên gia phân tích dữ liệu kinh doanh." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    return res.json({
      analysis: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("Groq AI error:", error);
    res.status(500).json({ message: "AI phân tích thất bại" });
  }
};
