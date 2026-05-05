const express = require("express");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const upload = require("../middleware/multer");
const { getMenus, getMenu, createMenu, updateMenu, deleteMenu } = require("../controllers/menus.controller");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: Gestion des menus
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Menu:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
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
 *     MenuInput:
 *       type: object
 *       required:
 *         - name
 *         - products
 *         - price
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         products:
 *           type: array
 *           items:
 *             type: string
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
 * /wacdo/menus:
 *   get:
 *     summary: Récupérer tous les menus
 *     description: Retourne la liste des menus avec les produits associés. Route réservée aux administrateurs et à la réception.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des menus
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Menu'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.get("/", auth, authorizeRoles("admin", "reception"), getMenus);

/**
 * @swagger
 * /wacdo/menus/{id}:
 *   get:
 *     summary: Récupérer un menu par ID
 *     description: Retourne le détail d'un menu. Route réservée aux administrateurs et à la réception.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB du menu
 *     responses:
 *       200:
 *         description: Menu trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Menu introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", auth, authorizeRoles("admin", "reception"), getMenu);

/**
 * @swagger
 * /wacdo/menus:
 *   post:
 *     summary: Créer un menu
 *     description: Crée un menu avec une liste de produits et une image optionnelle. Route réservée aux administrateurs.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/MenuInput'
 *     responses:
 *       201:
 *         description: Menu créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Données invalides ou produits inexistants
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.post("/", auth, authorizeRoles("admin"), upload.single("image"), createMenu);

/**
 * @swagger
 * /wacdo/menus/{id}:
 *   put:
 *     summary: Modifier un menu
 *     description: Modifie un menu existant. Si une nouvelle image est envoyée, l'ancienne est supprimée. Route réservée aux administrateurs.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/MenuInput'
 *     responses:
 *       200:
 *         description: Menu modifié avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Menu introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id", auth, authorizeRoles("admin"), upload.single("image"), updateMenu);

/**
 * @swagger
 * /wacdo/menus/{id}:
 *   delete:
 *     summary: Supprimer un menu
 *     description: Supprime un menu et son image associée. Route réservée aux administrateurs.
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu supprimé avec succès
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Menu introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", auth, authorizeRoles("admin"), deleteMenu);

module.exports = router;
