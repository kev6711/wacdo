const User = require("../models/user.model");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passwordValidator = require("password-validator");
const { validationResult } = require("express-validator");

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Veuillez renseigner un email valide" });
    }

    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Email et mot de passe obligatoire" });

        const existingUser = await User.findOne({ email });
        if (!existingUser) return res.status(401).json({ message: "Identifiants invalides" });

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) return res.status(401).json({ message: "Identifiants invalides" });

        const token = jwt.sign(
            { userId: existingUser._id, role: existingUser.role },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            },
        );
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la connexion" });
    }
};

exports.createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Veuillez renseigner un email valide" });
    }
    try {
        const { name, email, password, role } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Email et mot de passe obligatoire" });

        const schema = new passwordValidator();
        schema.is().min(8).has().uppercase().has().digits();
        if (!schema.validate(password))
            return res.status(400).json({
                message:
                    "Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre",
            });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Compte déjà existant" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role,
        });

        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la création de l'utilisateur" });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            error: "Erreur lors de la récupération des utilisateurs",
        });
    }
};

exports.getUser = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ error: "ID invalide" });

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            error: "Erreur lors de la récupération de l'utilisateur",
        });
    }
};

exports.updateUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Veuillez renseigner un email valide" });
    }
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ error: "ID invalide" });

        const { name, email, password, role } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

        if (name) user.name = name;
        if (email) {
            const existingUser = await User.findOne({ email });
            // On contrôle si l'email est déjà attribué à un autre utilisateur sans bloquer le cas où l'email correspond à l'utilisateur qui effectue la requête de modification
            if (existingUser && !existingUser._id.equals(id))
                return res.status(400).json({ message: "Compte déjà existant" });

            user.email = email;
        }
        if (password) {
            const schema = new passwordValidator();
            schema.is().min(8).has().uppercase().has().digits();
            if (!schema.validate(password))
                return res.status(400).json({
                    message:
                        "Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre",
                });

            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }
        if (role) user.role = role;

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la modification de l'utilisateur" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ error: "ID invalide" });

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

        await user.deleteOne();
        res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
    }
};
