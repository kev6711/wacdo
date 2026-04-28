const Product = require("../models/product.model");
const mongoose = require("mongoose");

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            error: "Erreur lors de la récupération des produits",
        });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID invalide" });

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ error: "Produit introuvable" });

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            error: "Erreur lors de la récupération du produit",
        });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, description, category, availability, price } = req.body;
        const image = req.file ? req.file.filename : undefined;
        if (!name || !category || price === undefined)
            return res.status(400).json({ error: "Nom, catégorie et prix du produit obligatoires" });

        const existingProduct = await Product.findOne({ name });
        if (existingProduct) return res.status(400).json({ error: "Produit déjà existant" });

        const product = new Product({
            name,
            description,
            category,
            image,
            availability,
            price,
        });

        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la création du produit" });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID invalide" });

        const { name, description, category, availability, price } = req.body;
        const image = req.file ? req.file.filename : undefined;

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ error: "Produit introuvable" });

        if (name !== undefined) {
            const existingProduct = await Product.findOne({ name });
            if (existingProduct && !existingProduct._id.equals(product._id))
                return res.status(400).json({ error: "Produit déjà existant" });

            product.name = name;
        }
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = category;
        if (image !== undefined) product.image = image;
        if (availability !== undefined) product.availability = availability;
        if (price !== undefined) product.price = price;

        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la modification du produit" });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID invalide" });

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ error: "Produit introuvable" });

        await product.deleteOne();
        res.status(200).json({ message: "Produit supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la suppression du produit" });
    }
};
