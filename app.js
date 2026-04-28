const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(helmet());
app.use(cors());
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    }),
);
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/wacdo/users", require("./routes/users.routes"));
app.use("/wacdo/products", require("./routes/products.routes"));

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    } catch (error) {
        console.error("Failed to start server:", error.message);
    }
};

startServer();
