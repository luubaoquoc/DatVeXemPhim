import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import connectDB from "./configs/db.js";
import authRoutes from "./routes/authRoutes.js";

import taiKhoanRoutes from './routes/taiKhoanRoutes.js';
import phimRoutes from './routes/phimRoutes.js';
import daoDienRoutes from './routes/daoDienRoutes.js';
import theLoaiRoutes from './routes/theLoaiRoutes.js';
import dienVienRoutes from './routes/dienVienRoutes.js';
import suatChieuRoutes from './routes/suatChieuRoutes.js';
import datVeRoutes from './routes/datVeRoutes.js';
import datVeComboRoutes from './routes/comboDoAnRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import phongChieuRoutes from './routes/phongChieuRoutes.js';
import rapRoutes from './routes/rapRoutes.js';
import gheRoutes from './routes/gheRoutes.js';
import anhBannerRoutes from './routes/anhBannerRoutes.js';
import dashboard from './routes/dashboardRoutes.js';
import danhGiaRoutes from './routes/danhGiaRoutes.js';
import khuyenMaiRoutes from './routes/khuyenMaiRoutes.js';
import chatBoxRoutes from './routes/chatBoxRoutes.js';
import './crons/index.js';
import { stripeWebhook } from "./controllers/paymentController.js";
// import { runAllCronsNow } from './crons/index.js';


const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

await connectDB();


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

app.post(
  '/api/payment/stripe-webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);
app.use(express.json());
app.use('/api/payment', paymentRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/taikhoan', taiKhoanRoutes);
app.use('/api/phim', phimRoutes);
app.use('/api/daodien', daoDienRoutes);
app.use('/api/theloai', theLoaiRoutes);
app.use('/api/dienvien', dienVienRoutes);
app.use('/api/suatchieu', suatChieuRoutes);
app.use('/api/datve', datVeRoutes);
app.use('/api/combodoan', datVeComboRoutes);
app.use('/api/phongchieu', phongChieuRoutes);
app.use('/api/rap', rapRoutes);
app.use("/api/ghe", gheRoutes);
app.use('/api/anhbanner', anhBannerRoutes);
app.use('/api/admin', dashboard);
app.use('/api/danhgia', danhGiaRoutes);
app.use('/api/khuyenmai', khuyenMaiRoutes);
app.use('/api/ai', chatBoxRoutes);


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
  }
  );
}

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);

})

