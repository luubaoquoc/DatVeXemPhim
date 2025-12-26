import sequelize from './sequelize.js';

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL (TiDB Cloud) connected successfully!');

    // IMPORTANT: Ở production, KHÔNG dùng sync({ alter: true }) vì dễ gây lỗi ER_TOO_MANY_KEYS
    // (Sequelize tạo index mới mỗi lần restart, MySQL/TiDB giới hạn max 64 keys/table)
    if (process.env.NODE_ENV === 'development') {
      // Chỉ sync ở dev, và dùng force: false hoặc alter: false để an toàn
      await sequelize.sync({ force: false }); // force: true sẽ drop table (dùng cẩn thận!)
      console.log('Models synchronized (dev mode).');
    } else {
      console.log('Production mode: Skipping auto-sync. Use migrations instead!');
      // Nên dùng Sequelize migrations (npx sequelize-cli migration:generate...) cho production
    }
  } catch (error) {
    console.error('MySQL connection failure!', error);
    throw error;
  }
};

export default connectDB;