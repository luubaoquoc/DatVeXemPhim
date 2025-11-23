import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./configs/db.js";
import authRoutes from "./routes/authRoutes.js";

import nguoiDungRoutes from './routes/NguoiDungRoutes.js';
import phimRoutes from './routes/PhimRoutes.js';
import daoDienRoutes from './routes/daoDienRoutes.js';
import theLoaiRoutes from './routes/theLoaiRoutes.js';
import dienVienRoutes from './routes/dienVienRoutes.js';
import suatChieuRoutes from './routes/SuatChieuRoutes.js';
import datVeRoutes from './routes/DatVeRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import phongChieuRoutes from './routes/phongChieuRoutes.js';
import rapRoutes from './routes/rapRoutes.js';
import anhBannerRoutes from './routes/anhBannerRoutes.js';
import './crons/index.js';
// import { runAllCronsNow } from './crons/index.js';


const app = express();
const PORT = process.env.PORT || 5000;

await connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Route test cron
// app.get('/test-cron', async (req, res) => {
//   try {
//     await runAllCronsNow();
//     res.json({ message: 'Đã chạy cron job thủ công thành công!' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Lỗi khi test cron job' });
//   }
// });


app.use("/api/auth", authRoutes);
app.use('/api/nguoidung', nguoiDungRoutes);
app.use('/api/phim', phimRoutes);
app.use('/api/daodien', daoDienRoutes);
app.use('/api/theloai', theLoaiRoutes);
app.use('/api/dienvien', dienVienRoutes);
app.use('/api/suatchieu', suatChieuRoutes);
app.use('/api/datve', datVeRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/phongchieu', phongChieuRoutes);
app.use('/api/rap', rapRoutes);
app.use('/api/anhbanner', anhBannerRoutes);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);

})

