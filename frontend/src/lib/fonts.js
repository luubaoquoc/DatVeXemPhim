

export const addRobotoFont = (doc) => {
  const fontUrl = "/fonts/Roboto-Regular.ttf"; // URL từ public
  fetch(fontUrl)
    .then((res) => res.arrayBuffer())
    .then((buffer) => {
      const base64 = arrayBufferToBase64(buffer);
      doc.addFileToVFS("Roboto.ttf", base64);
      doc.addFont("Roboto.ttf", "Roboto", "normal");
    });
};

// Hàm chuyển ArrayBuffer sang Base64
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
