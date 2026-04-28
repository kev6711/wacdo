const express = require("express");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const { body } = require("express-validator");
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    login,
} = require("../controllers/users.controller");
const router = express.Router();

router.post("/login", body("email").isEmail(), login);
router.post("/", auth, isAdmin, body("email").isEmail(), createUser);
router.get("/", auth, isAdmin, getUsers);
router.get("/:id", auth, isAdmin, getUser);
router.put("/:id", auth, isAdmin, body("email").optional().isEmail(), updateUser);
router.delete("/:id", auth, isAdmin, deleteUser);

module.exports = router;
