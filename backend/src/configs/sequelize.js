import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.MYSQL_DATABASE || 'GoCinema', process.env.MYSQL_USER || 'root', process.env.MYSQL_PASSWORD || '', {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  dialect: 'mysql',
  logging: console.log,

  timezone: '+07:00', // Lưu & đọc theo giờ VN (GMT+7)
  dialectOptions: {
    dateStrings: true, // Trả về chuỗi thay vì Date object
    typeCast: function (field, next) {
      // Giúp MySQL đọc đúng DATETIME / TIMESTAMP
      if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
        return field.string();
      }
      return next();
    }
  }
});

export default sequelize;
