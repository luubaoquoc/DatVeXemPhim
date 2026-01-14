import AnhBanner from '../models/AnhBanner.js';
import cloudinary from '../configs/cloudinary.js';
import streamifier from 'streamifier'

// Lấy tất cả ảnh banner
export const getAllAnhBanner = async (req, res) => {
  try {
    const anhBanners = await AnhBanner.findAll({
      order: [['maAnhBanner', 'DESC']]
    });

    res.json(anhBanners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách ảnh banner' });
  }
}

// Thêm ảnh banner
export const createAnhBanner = async (req, res) => {
  try {
    let posterUrl = null
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'posters',
            resource_type: 'image',
            width: 1920,
            height: 639,
            crop: "fill",
          },
          (error, result) => {
            if (error) {
              console.error(' Lỗi upload Cloudinary:', error)
              return reject(error)
            }
            resolve(result)
          }
        )

        streamifier.createReadStream(req.file.buffer).pipe(stream)
      })

      posterUrl = uploadResult.secure_url
    }

    const newAnhBanner = await AnhBanner.create({ anh: posterUrl });
    res.status(201).json(newAnhBanner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi tạo ảnh banner' });
  }
}

// Sửa ảnh banner
export const updateAnhBanner = async (req, res) => {
  try {
    const { maAnhBanner } = req.params;

    const anhBanner = await AnhBanner.findByPk(maAnhBanner);

    if (!anhBanner) return res.status(404).json({ message: 'Không tìm thấy ảnh banner' });

    let posterUrl = anhBanner.anh;

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'posters',
            resource_type: 'image',
            width: 1920,
            height: 639,
            crop: "fill",
          },
          (error, result) => {
            if (error) {
              console.error(' Lỗi upload Cloudinary:', error)
              return reject(error)
            }
            resolve(result)
          }
        )

        streamifier.createReadStream(req.file.buffer).pipe(stream)
      })
      posterUrl = uploadResult.secure_url
    }
    await anhBanner.update({ anh: posterUrl });
    res.json(anhBanner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật ảnh banner' });
  }
}

// Xóa ảnh banner
export const deleteAnhBanner = async (req, res) => {
  try {
    const { maAnhBanner } = req.params;
    const anhBanner = await AnhBanner.findByPk(maAnhBanner);
    if (!anhBanner) return res.status(404).json({ message: 'Không tìm thấy ảnh banner' });
    await anhBanner.destroy();
    res.json({ message: 'Xóa ảnh banner thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi xóa ảnh banner' });
  }
}
