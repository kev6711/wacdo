const express = require("express");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const upload = require("../middleware/multer");
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} = require("../controllers/products.controller");
const router = express.Router();

router.get("/", auth, isAdmin, getProducts);
router.get("/:id", auth, isAdmin, getProduct);
router.post("/", auth, isAdmin, upload.single("image"), createProduct);
router.put("/:id", auth, isAdmin, upload.single("image"), updateProduct);
router.delete("/:id", auth, isAdmin, deleteProduct);

module.exports = router;
