const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, callback) => callback(null, "uploads/"),
    filename: (req, file, callback) => {
        // on aura un fichier de type test.png => 1254245231453-24583.png (côté back-end)
        const unique = Date.now() + "-" + Math.round(Math.random() * 100000);
        callback(null, unique + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, callback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isExtensionValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const isMimetypeValid = allowedTypes.test(file.mimetype);
    if (isExtensionValid && isMimetypeValid) callback(null, true);
    else callback(new Error("Seules les images sont autorisées"));
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    // 5 Mo
    limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
