const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
        ],
        image: { type: String },
        availability: { type: Boolean, default: true },
        price: { type: Number, required: true, min: 0 },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Menu", menuSchema);
