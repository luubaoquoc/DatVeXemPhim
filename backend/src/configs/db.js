import sequelize from './sequelize.js';

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected successfully!');

    if (process.env.NODE_ENV === 'development') {
      
      await sequelize.sync({ force: false }); // force: true sẽ drop table (dùng cẩn thận!)
      console.log('Models synchronized (dev mode).');
    } else {
      console.log('Production mode: Skipping auto-sync. Use migrations instead!');
      
    }
  } catch (error) {
    console.error('MySQL connection failure!', error);
    throw error;
  }
};

export default connectDB;