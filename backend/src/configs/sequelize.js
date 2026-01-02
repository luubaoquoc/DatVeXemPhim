// import { Sequelize } from 'sequelize';
// import dotenv from 'dotenv';
// dotenv.config();

// // Ưu tiên dùng DATABASE_URL từ env (cho TiDB Cloud)
// // Nếu không có, fallback về local cho dev
// const sequelize = new Sequelize(
//   // process.env.DATABASE_URL || 'mysql://root:@localhost:3306/GoCinema',
//   process.env.MYSQL_DATABASE || 'GoCinema', process.env.MYSQL_USER || 'root', process.env.MYSQL_PASSWORD || '',
//   {
//     host: process.env.MYSQL_HOST || 'localhost',
//     port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
//     dialect: 'mysql',
//     logging: process.env.NODE_ENV === 'development' ? console.log : false,

//     timezone: '+07:00', // Giữ nguyên, tốt cho giờ VN

//     dialectOptions: {
//       dateStrings: true,
//       typeCast: function (field, next) {
//         if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
//           return field.string();
//         }
//         return next();
//       },

//       // BẮT BUỘC cho TiDB Cloud: SSL luôn enable
//       // ssl: {
//       //   rejectUnauthorized: true,  // Verify certificate (an toàn nhất)
//       //   // Nếu gặp lỗi SSL handshake, thử rejectUnauthorized: false (nhưng kém an toàn hơn)
//       // },
//     },


//   }
// );

// export default sequelize;



import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Ưu tiên dùng DATABASE_URL từ env (cho TiDB Cloud)
// Nếu không có, fallback về local cho dev
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'mysql://root:@localhost:3306/GoCinema',
  {
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    // 

    // timezone: '+07:00', // Giữ nguyên, tốt cho giờ VN

    dialectOptions: {
      dateStrings: true,
      typeCast: function (field, next) {
        if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
          return field.string();
        }
        return next();
      },

      // BẮT BUỘC cho TiDB Cloud: SSL luôn enable
      ssl: {
        rejectUnauthorized: true,  // Verify certificate (an toàn nhất)
        // Nếu gặp lỗi SSL handshake, thử rejectUnauthorized: false (nhưng kém an toàn hơn)
      },
    },

    // Tùy chọn tốt cho serverless (Vercel)
    pool: {
      max: 5,         // Giới hạn connection pool nhỏ
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;