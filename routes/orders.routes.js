const express = require("express");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const { getOrders, getOrder, createOrder, updateOrder, deleteOrder } = require("../controllers/orders.controller");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Gestion des commandes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderProductInput:
 *       type: object
 *       required:
 *         - product
 *       properties:
 *         product:
 *           type: string
 *         quantity:
 *           type: number
 *
 *     OrderMenuInput:
 *       type: object
 *       required:
 *         - menu
 *       properties:
 *         menu:
 *           type: string
 *         quantity:
 *           type: number
 *
 *     OrderInput:
 *       type: object
 *       required:
 *         - products
 *         - menus
 *         - user
 *         - deliveryTime
 *       properties:
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderProductInput'
 *         menus:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderMenuInput'
 *         user:
 *           type: string
 *         deliveryTime:
 *           type: string
 *           format: date-time
 *
 *     OrderUpdateInput:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [awaiting_preparation, in_preparation, prepared, delivered]
 *         deliveryTime:
 *           type: string
 *           format: date-time
 *
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         status:
 *           type: string
 *           enum: [awaiting_preparation, in_preparation, prepared, delivered]
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 $ref: '#/components/schemas/Product'
 *               quantity:
 *                 type: number
 *               unitPrice:
 *                 type: number
 *         menus:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               menu:
 *                 $ref: '#/components/schemas/Menu'
 *               quantity:
 *                 type: number
 *               unitPrice:
 *                 type: number
 *         user:
 *           $ref: '#/components/schemas/User'
 *         totalPrice:
 *           type: number
 *         deliveryTime:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /wacdo/orders:
 *   get:
 *     summary: Récupérer les commandes
 *     description: Retourne les commandes triées par heure de livraison croissante. Les résultats sont filtrés selon le rôle connecté.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des commandes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get("/", auth, getOrders);

/**
 * @swagger
 * /wacdo/orders/{id}:
 *   get:
 *     summary: Récupérer une commande par ID
 *     description: Retourne le détail d'une commande si le rôle connecté y a accès.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB de la commande
 *     responses:
 *       200:
 *         description: Commande trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Commande introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", auth, getOrder);

/**
 * @swagger
 * /wacdo/orders:
 *   post:
 *     summary: Créer une commande
 *     description: Crée une commande à partir de produits et/ou menus. Le prix total est calculé automatiquement côté serveur.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *     responses:
 *       201:
 *         description: Commande créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Données invalides, utilisateur introuvable, produit introuvable ou menu introuvable
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.post("/", auth, authorizeRoles("admin", "reception"), createOrder);

/**
 * @swagger
 * /wacdo/orders/{id}:
 *   put:
 *     summary: Modifier une commande
 *     description: Modifie le statut et/ou l'heure de livraison d'une commande selon les droits du rôle connecté.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB de la commande
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderUpdateInput'
 *     responses:
 *       200:
 *         description: Commande modifiée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: ID invalide ou données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Changement refusé selon le rôle
 *       404:
 *         description: Commande introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id", auth, updateOrder);

/**
 * @swagger
 * /wacdo/orders/{id}:
 *   delete:
 *     summary: Supprimer une commande
 *     description: Supprime une commande. Route réservée aux administrateurs.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB de la commande
 *     responses:
 *       200:
 *         description: Commande supprimée avec succès
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Commande introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", auth, authorizeRoles("admin"), deleteOrder);

module.exports = router;
