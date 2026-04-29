const express = require("express");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const upload = require("../middleware/multer");
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} = require("../controllers/products.controller");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Gestion des produits
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           enum: [burger, side_dish, drink, dessert]
 *         image:
 *           type: string
 *         availability:
 *           type: boolean
 *         price:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     ProductInput:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - price
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           enum: [burger, side_dish, drink, dessert]
 *         image:
 *           type: string
 *           format: binary
 *         availability:
 *           type: boolean
 *         price:
 *           type: number
 */

/**
 * @swagger
 * /wacdo/products:
 *   get:
 *     summary: Récupérer tous les produits
 *     description: Retourne la liste des produits triés du plus récent au plus ancien. Route réservée aux administrateurs.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des produits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.get("/", auth, authorizeRoles("admin"), getProducts);

/**
 * @swagger
 * /wacdo/products/{id}:
 *   get:
 *     summary: Récupérer un produit par ID
 *     description: Retourne le détail d'un produit. Route réservée aux administrateurs.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB du produit
 *     responses:
 *       200:
 *         description: Produit trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Produit introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", auth, authorizeRoles("admin"), getProduct);

/**
 * @swagger
 * /wacdo/products:
 *   post:
 *     summary: Créer un produit
 *     description: Crée un nouveau produit avec une image optionnelle. Route réservée aux administrateurs.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Données invalides ou produit déjà existant
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.post("/", auth, authorizeRoles("admin"), upload.single("image"), createProduct);

/**
 * @swagger
 * /wacdo/products/{id}:
 *   put:
 *     summary: Modifier un produit
 *     description: Modifie un produit existant. Si une nouvelle image est envoyée, l'ancienne est supprimée du dossier uploads.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB du produit
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Produit modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: ID invalide, données invalides ou produit déjà existant
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Produit introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id", auth, authorizeRoles("admin"), upload.single("image"), updateProduct);

/**
 * @swagger
 * /wacdo/products/{id}:
 *   delete:
 *     summary: Supprimer un produit
 *     description: Supprime un produit ainsi que son image associée dans le dossier uploads.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB du produit
 *     responses:
 *       200:
 *         description: Produit supprimé avec succès
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Produit introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", auth, authorizeRoles("admin"), deleteProduct);

module.exports = router;
