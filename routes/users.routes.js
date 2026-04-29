const express = require("express");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const { body } = require("express-validator");
const { getUsers, getUser, createUser, updateUser, deleteUser, login } = require("../controllers/users.controller");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Authentification et gestion des utilisateurs
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, order_picker, reception]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     UserInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, order_picker, reception]
 *
 *     UserUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, order_picker, reception]
 *
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 */

/**
 * @swagger
 * /wacdo/users/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     description: Connecte un utilisateur et retourne un token JWT valide pendant 7 jours.
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Email et mot de passe obligatoire
 *       401:
 *         description: Identifiants invalides
 *       500:
 *         description: Erreur serveur
 */

router.post("/login", body("email").isEmail(), login);

/**
 * @swagger
 * /wacdo/users:
 *   post:
 *     summary: Créer un utilisateur
 *     description: Crée un utilisateur interne. Route réservée aux administrateurs.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides ou compte déjà existant
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.post("/", auth, authorizeRoles("admin"), body("email").isEmail(), createUser);

/**
 * @swagger
 * /wacdo/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     description: Retourne la liste des utilisateurs. Route réservée aux administrateurs.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.get("/", auth, authorizeRoles("admin"), getUsers);

/**
 * @swagger
 * /wacdo/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", auth, authorizeRoles("admin"), getUser);

/**
 * @swagger
 * /wacdo/users/{id}:
 *   put:
 *     summary: Modifier un utilisateur
 *     description: Modifie les informations d'un utilisateur. Route réservée aux administrateurs.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateInput'
 *     responses:
 *       200:
 *         description: Utilisateur modifié avec succès
 *       400:
 *         description: Données invalides, email déjà utilisé ou mot de passe invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id", auth, authorizeRoles("admin"), body("email").optional().isEmail(), updateUser);

/**
 * @swagger
 * /wacdo/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     description: Supprime un utilisateur. Route réservée aux administrateurs.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID MongoDB de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", auth, authorizeRoles("admin"), deleteUser);

module.exports = router;
