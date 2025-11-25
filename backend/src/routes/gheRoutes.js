import express from "express";
import { listGheByPhong, updateGhe } from "../controllers/gheController.js";
const router = express.Router();

router.get("/", listGheByPhong);
router.put("/:maGhe", updateGhe);

export default router;
