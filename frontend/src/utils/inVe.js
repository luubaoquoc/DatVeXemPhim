export const inVe = (booking) => {
  const suat = booking.suatChieu;
  const phim = suat.phim;
  const rap = suat.phongChieu.rap;
  const phong = suat.phongChieu;

  console.log(suat);
  console.log(phim);
  console.log(rap);
  console.log(phong);


  let html = `
    <html>
    <head>
      <title>In vé</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        .ticket { padding: 16px; margin: 40px 0; page-break-after: always; }
        .rap-info { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #333; padding: 10px; }
        .rap-info h2 { margin: 0; font-size: 24px; }
        .rap-info p { margin: 4px 0 0 0; font-size: 20px; }
        .title { font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 30px; }
        .ma-ve, .ngay-chieu { font-size: 20px; margin-bottom: 10px; }
        .phim-info { display: flex; justify-content: space-between; font-size: 22px; }
        .phim-info .phim { font-size: 22px; font-weight: bold; }
        .phong-ghe { display: flex; justify-content: space-between; font-size: 22px; margin-bottom: 20px; border-bottom: 1px dashed #333; padding-bottom: 10px; }
        .qr { text-align: center; margin: 20px 0; }
        .luu-y { font-size: 16px; margin-bottom: 20px; }
        .footer { text-align: center; font-size: 24px; color: #555; margin-top: 30px; }
        img { width: 160px; height: 160px; }
        </style>
    </head>
    <body>
  `;

  booking.chiTietDatVes.forEach((item) => {
    const ghe = `${item.ghe.hang}${item.ghe.soGhe}`;

    html += `
      <div class="ticket">
        <div class="rap-info">
          <h2>RẠP CHIẾU PHIM ${rap.tenRap.toUpperCase()}</h2>
          <p>${rap.diaChi}</p>
        </div>

        <div class="title">VÉ XEM PHIM</div>

         <div class="qr">
           <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${item.maChiTiet}" />
         </div>

        <p class="ma-ve"><b>Mã vé:</b> ${item.maChiTiet}</p>
        <p class="ngay-chieu"><b>Ngày chiếu:</b> ${suat.gioBatDau}</p>

        <div class="phim-info">
          <p class="phim">Phim: ${phim.tenPhim}</p>
          <p><b>Giá vé:</b> ${item?.giaVe?.toLocaleString()} VND</p>
        </div>

        <div class="phong-ghe">
          <p><b>Ghế:</b> ${ghe}</p>
          <p><b>Phòng:</b> ${phong.tenPhong}</p>
        </div>

        <p class="luu-y"><b>***Lưu ý:</b> Vui lòng giữ vé này để đối chiếu khi vào rạp.</p>

        <div class="footer">
          <p>Xin cảm ơn quý khách! Chúc quý khách xem phim vui vẻ!</p>
          <p>Go Cinema - Nền tảng đặt vé xem phim hàng đầu</p>
        </div>
      </div>
    `;
  });

  html += `</body></html>`;

  // Tạo iframe ẩn
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";

  document.body.appendChild(iframe);

  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  setTimeout(() => {
    iframe.contentWindow.print();
    document.body.removeChild(iframe);
  }, 300);
};
