const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(
            `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.d2zoexh.mongodb.net/wacdo`,
        );
        console.log("MongoDB connected");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        throw error;
    }
};

module.exports = connectDB;
