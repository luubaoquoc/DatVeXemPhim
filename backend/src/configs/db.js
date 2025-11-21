import sequelize from './sequelize.js';

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // NOTE: sync({ alter: true }) attempts to alter existing tables to match models
    // which can trigger ALTER statements (and in this case caused an ER_TOO_MANY_KEYS error).
    // Use plain sync() to only create missing tables without altering existing ones,
    // or remove sync in production and use migrations instead.
    await sequelize.sync();
    console.log('MySQL connected and models synchronized.');
  } catch (error) {
    console.error('MySQL connection failure!', error);
    throw error;
  }
}

export default connectDB;