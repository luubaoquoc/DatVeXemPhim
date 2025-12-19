import cron from "node-cron";
import { xoaVeDangCho } from "./xoaVeDangCho.js";
import { xoaNguoiDungChuaXacThuc } from "./xoaNguoiDungChuaXacThuc.js";

//  Cron 1: Xóa vé chưa thanh toán (mỗi 1 phút)
cron.schedule("*/1 * * * *", async () => {
  console.log("[CRON] Đang kiểm tra và xóa vé hết hạn...");
  await xoaVeDangCho();
});

//  Cron 2: Xóa tài khoản chưa xác thực (mỗi ngày lúc 2h sáng)
cron.schedule("0 2 * * *", async () => {
  console.log("[CRON] Đang dọn tài khoản chưa xác thực...");
  await xoaNguoiDungChuaXacThuc();
});


// export const runAllCronsNow = async () => {
//   console.log('Đang test cron job thủ công...');
//   await xoaVeDangCho();
//   await xoaNguoiDungChuaXacThuc();
// };
console.log("Cron jobs đã được khởi động.");
