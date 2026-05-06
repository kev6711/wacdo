const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const setupSwagger = require("./swagger");

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
if (process.env.NODE_ENV !== "test") {
    connectDB();
}

app.use(
    helmet({
        contentSecurityPolicy: false,
    }),
);
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
app.use("/wacdo/menus", require("./routes/menus.routes"));
app.use("/wacdo/orders", require("./routes/orders.routes"));

setupSwagger(app);

module.exports = app;
