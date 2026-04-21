const express = require("express");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const upload = require("../middleware/multer");
const { getMenus, getMenu, createMenu, updateMenu, deleteMenu } = require("../controllers/menus.controller");
const router = express.Router();

router.get("/", auth, isAdmin, getMenus);
router.get("/:id", auth, isAdmin, getMenu);
router.post("/", auth, isAdmin, upload.single("image"), createMenu);
router.put("/:id", auth, isAdmin, upload.single("image"), updateMenu);
router.delete("/:id", auth, isAdmin, deleteMenu);

module.exports = router;
