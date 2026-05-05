const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const User = require("../models/user.model");
const Product = require("../models/product.model");
const Menu = require("../models/menu.model");

let mongoServer;
let adminToken;
let receptionToken;

const createToken = (user) => {
    return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

beforeAll(async () => {
    process.env.JWT_SECRET = "testsecret";

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await User.deleteMany();
    await Product.deleteMany();
    await Menu.deleteMany();

    const admin = await User.create({
        name: "admin",
        email: "admin@test.com",
        password: "Password123",
        role: "admin",
    });

    const reception = await User.create({
        name: "reception",
        email: "reception@test.com",
        password: "Password123",
        role: "reception",
    });

    adminToken = createToken(admin);
    receptionToken = createToken(reception);
});

describe("Menus routes", () => {
    it("should return 401 if user is not authenticated", async () => {
        const res = await request(app).get("/wacdo/menus");

        expect(res.statusCode).toBe(401);
    });

    it("should create a menu if user is admin", async () => {
        const product = await Product.create({
            name: "Big Wac",
            category: "burger",
            price: 9.99,
        });

        const res = await request(app)
            .post("/wacdo/menus")
            .set("Authorization", `Bearer ${adminToken}`)
            .field("name", "Menu Big Wac")
            .field("description", "Burger + frites + boisson")
            .field("products[]", product._id.toString())
            .field("availability", "true")
            .field("price", "12.9");

        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe("Menu Big Wac");
        expect(res.body.products).toContain(product._id.toString());
        expect(res.body.price).toBe(12.9);
    });

    it("should return 400 if required fields are missing", async () => {
        const res = await request(app)
            .post("/wacdo/menus")
            .set("Authorization", `Bearer ${adminToken}`)
            .field("name", "Menu Big Wac");

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Nom, produits et prix du menu obligatoires");
    });

    it("should return 400 if product does not exist", async () => {
        const fakeProductId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .post("/wacdo/menus")
            .set("Authorization", `Bearer ${adminToken}`)
            .field("name", "Menu Big Wac")
            .field("products[]", fakeProductId.toString())
            .field("price", "12.9");

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Produit introuvable");
    });

    it("should update a menu if user is admin", async () => {
        const product = await Product.create({
            name: "Big Wac",
            category: "burger",
            price: 9.99,
        });

        const menu = await Menu.create({
            name: "Menu Big Wac",
            products: [product._id],
            price: 12.9,
        });

        const res = await request(app)
            .put(`/wacdo/menus/${menu._id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .field("name", "Menu Big Wac Bacon")
            .field("price", "14.5");

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("Menu Big Wac Bacon");
        expect(res.body.price).toBe(14.5);
    });

    it("should delete a menu if user is admin", async () => {
        const product = await Product.create({
            name: "Big Wac",
            category: "burger",
            price: 9.99,
        });

        const menu = await Menu.create({
            name: "Menu Big Wac",
            products: [product._id],
            price: 12.9,
        });

        const res = await request(app).delete(`/wacdo/menus/${menu._id}`).set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);

        const deletedMenu = await Menu.findById(menu._id);
        expect(deletedMenu).toBeNull();
    });
});
