const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/wacdo/orders", (req, res) => {
    res.status(200).json([
        {
            id: 1,
            status: "AWAITING_PREPARATION",
            user_id: 5,
            date: "2026-04-08T16:00:00Z",
            total_amount: 25,
            order_lines: [
                {
                    id: 1,
                    item_type: "PRODUCT",
                    product_id: 1,
                    menu_id: null,
                    quantity: 1,
                    unit_price: 10,
                    total_price: 10,
                },
                {
                    id: 2,
                    item_type: "MENU",
                    product_id: null,
                    menu_id: 2,
                    quantity: 1,
                    unit_price: 15,
                    total_price: 15,
                },
            ],
        },
    ]);
});

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    } catch (error) {
        console.error("Failed to start server:", error.message);
    }
};

startServer();
