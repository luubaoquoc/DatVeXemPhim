import multer from 'multer';

// Lưu file tạm trong RAM
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
