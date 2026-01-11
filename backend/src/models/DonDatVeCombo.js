import { DataTypes } from "sequelize";
import sequelize from "../configs/sequelize.js";
import DatVe from "./DatVe.js";
import ComBoDoAn from "./ComboDoAn.js";

const DonDatVeCombo = sequelize.define(
  "DonDatVeCombo",
  {
    maDonDatVeCombo: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    maDatVe: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DatVe,
        key: "maDatVe",
      },
    },

    maCombo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ComBoDoAn,
        key: "maCombo",
      },
    },

    soLuong: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    giaTaiThoiDiem: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    ngayTao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "DON_DAT_VE_COMBO",
    timestamps: false,
  }
);

export default DonDatVeCombo;
