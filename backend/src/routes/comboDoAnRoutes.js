import express from "express";
import { authenticateToken, hasRole } from "../middleware/authMiddleware.js";
import { 
    addOrUpdateComboToDatVe, 
    createCombo, 
    deleteCombo, 
    getAllComBoDoAn, 
    getAllCombos, 
    getComboByDatVe, 
    getComboById, 
    removeComboFromDatVe, 
    updateCombo 
} from "../controllers/comboDoAnController.js";
import upload from "../configs/multer.js";


const router = express.Router();

router.get("/combos", authenticateToken, getAllComBoDoAn);

router.get("/:maDatVe/combos", authenticateToken, getComboByDatVe);
router.post("/:maDatVe/combos", authenticateToken, addOrUpdateComboToDatVe);
router.delete("/:maDatVe/combos/:maCombo", authenticateToken, removeComboFromDatVe);

router.get("/", authenticateToken, hasRole(3, 4), getAllCombos);
router.get("/:maCombo", authenticateToken, hasRole(3, 4), getComboById);
router.post("/", authenticateToken, hasRole(3, 4), upload.single('hinhAnh'), createCombo);
router.put("/:maCombo", authenticateToken, hasRole(3, 4), upload.single('hinhAnh'), updateCombo);
router.delete("/:maCombo", authenticateToken, hasRole(3, 4), deleteCombo);

export default router;
