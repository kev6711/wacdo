const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer "))
            return res.status(401).json({ message: "Veuillez vous connecter" });

        const token = authHeader.split(" ")[1];

        const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedUser;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Veuillez vous connecter" });
    }
};

module.exports = auth;
