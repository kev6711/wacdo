const Menu = require("../models/menu.model");
const Product = require("../models/product.model");
const mongoose = require("mongoose");

exports.getMenus = async (req, res) => {
    try {
        const menus = await Menu.find()
            .populate("products", "name image availability price")
            .sort({ createdAt: -1 });
        res.status(200).json(menus);
    } catch (error) {
        res.status(500).json({
            error: "Erreur lors de la récupération des menus",
        });
    }
};

exports.getMenu = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID invalide" });

        const menu = await Menu.findById(id).populate("products", "name image availability price");
        if (!menu) return res.status(404).json({ error: "Menu introuvable" });

        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({
            error: "Erreur lors de la récupération du menu",
        });
    }
};

exports.createMenu = async (req, res) => {
    try {
        const { name, description, products, availability, price } = req.body;
        const image = req.file ? req.file.filename : undefined;
        if (!name || !Array.isArray(products) || products.length === 0 || price === undefined)
            return res.status(400).json({ error: "Nom, produits et prix du menu obligatoires" });

        const existingMenu = await Menu.findOne({ name });
        if (existingMenu) return res.status(400).json({ error: "Menu déjà existant" });

        for (const id of products) {
            if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID invalide" });

            const existingProduct = await Product.findById(id);
            if (!existingProduct) return res.status(400).json({ error: "Produit introuvable" });
        }

        const menu = new Menu({
            name,
            description,
            products,
            image,
            availability,
            price,
        });

        const newMenu = await menu.save();
        res.status(201).json(newMenu);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la création du menu" });
    }
};

exports.updateMenu = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID invalide" });

        const { name, description, products, availability, price } = req.body;
        const image = req.file ? req.file.filename : undefined;

        const menu = await Menu.findById(id);
        if (!menu) return res.status(404).json({ error: "Menu introuvable" });

        if (name !== undefined) {
            const existingMenu = await Menu.findOne({ name });
            if (existingMenu && !existingMenu._id.equals(menu._id))
                return res.status(400).json({ error: "Menu déjà existant" });

            menu.name = name;
        }
        if (description !== undefined) menu.description = description;
        if (products !== undefined) {
            if (!Array.isArray(products) || products.length === 0) {
                return res.status(400).json({
                    error: "products doit être un tableau non vide",
                });
            }
            for (const id of products) {
                if (!mongoose.Types.ObjectId.isValid(id))
                    return res.status(400).json({ error: "ID invalide" });

                const existingProduct = await Product.findById(id);
                if (!existingProduct) return res.status(400).json({ error: "Produit introuvable" });
            }

            menu.products = products;
        }

        if (image !== undefined) menu.image = image;
        if (availability !== undefined) menu.availability = availability;
        if (price !== undefined) menu.price = price;

        const updatedMenu = await menu.save();
        res.status(200).json(updatedMenu);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la modification du menu" });
    }
};

exports.deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "ID invalide" });

        const menu = await Menu.findById(id);
        if (!menu) return res.status(404).json({ error: "Menu introuvable" });

        await menu.deleteOne();
        res.status(200).json({ message: "Menu supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la suppression du menu" });
    }
};
