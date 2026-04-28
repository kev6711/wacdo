const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        category: {
            type: String,
            enum: ["burger", "side_dish", "drink", "dessert"],
            required: true,
        },
        image: { type: String },
        availability: { type: Boolean, default: true },
        price: { type: Number, required: true, min: 0 },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
