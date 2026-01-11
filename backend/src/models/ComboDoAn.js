import { DataTypes } from "sequelize";
import sequelize from "../configs/sequelize.js";

const ComBoDoAn = sequelize.define(
  "ComBoDoAn",
  {
    maCombo: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    tenCombo: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    moTa: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    gia: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    hinhAnh: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    trangThai: {
      type: DataTypes.ENUM("Hoạt động", "Ngừng hoạt động"),
      defaultValue: "Hoạt động",
    },

    ngayTao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "COM_BO_DO_AN",
    timestamps: false,
  }
);

export default ComBoDoAn;
