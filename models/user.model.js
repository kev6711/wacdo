const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ["admin", "order_picker", "reception"],
            default: "reception",
        },
    },
    { timestamps: true },
);

// Nettoie l'objet utilisateur avant envoi (supprime le password quand on fait res.json(user))
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model("User", userSchema);
