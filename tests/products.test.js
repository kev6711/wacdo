const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const User = require("../models/user.model");
const Product = require("../models/product.model");

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

describe("Products routes", () => {
    it("should return 401 if user is not authenticated", async () => {
        const res = await request(app).get("/wacdo/products");

        expect(res.statusCode).toBe(401);
    });

    it("should get products if user is reception", async () => {
        await Product.create({
            name: "Big Wac",
            category: "burger",
            price: 9.99,
        });

        const res = await request(app).get("/wacdo/products").set("Authorization", `Bearer ${receptionToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    it("should get a product by id", async () => {
        const product = await Product.create({
            name: "Big Wac",
            category: "burger",
            price: 9.99,
        });

        const res = await request(app)
            .get(`/wacdo/products/${product._id}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("Big Wac");
    });

    it("should create a product if user is admin", async () => {
        const res = await request(app)
            .post("/wacdo/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .field("name", "Big Wac")
            .field("description", "Burger avec sauce maison")
            .field("category", "burger")
            .field("availability", "true")
            .field("price", "9.99");

        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe("Big Wac");
        expect(res.body.category).toBe("burger");
        expect(res.body.price).toBe(9.99);
    });

    it("should return 403 if reception tries to create a product", async () => {
        const res = await request(app)
            .post("/wacdo/products")
            .set("Authorization", `Bearer ${receptionToken}`)
            .field("name", "Big Wac")
            .field("category", "burger")
            .field("price", "9.99");

        expect(res.statusCode).toBe(403);
    });

    it("should return 400 if required fields are missing", async () => {
        const res = await request(app)
            .post("/wacdo/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .field("name", "Big Wac");

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Nom, catégorie et prix du produit obligatoires");
    });

    it("should get products by category", async () => {
        await Product.create({
            name: "Big Wac",
            category: "burger",
            price: 9.99,
        });

        await Product.create({
            name: "Cola",
            category: "drink",
            price: 2.5,
        });

        const res = await request(app)
            .get("/wacdo/products/category/burger")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].name).toBe("Big Wac");
        expect(res.body[0].category).toBe("burger");
    });

    it("should return 404 if category is invalid or empty", async () => {
        const res = await request(app)
            .get("/wacdo/products/category/pizza")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe("Catégorie invalide ou aucun produit trouvé pour cette catégorie");
    });

    it("should update a product if user is admin", async () => {
        const product = await Product.create({
            name: "Big Wac",
            category: "burger",
            price: 9.99,
        });

        const res = await request(app)
            .put(`/wacdo/products/${product._id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .field("name", "Big Wac Bacon")
            .field("price", "11.5");

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("Big Wac Bacon");
        expect(res.body.price).toBe(11.5);
    });

    it("should delete a product if user is admin", async () => {
        const product = await Product.create({
            name: "Big Wac",
            category: "burger",
            price: 9.99,
        });

        const res = await request(app)
            .delete(`/wacdo/products/${product._id}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);

        const deletedProduct = await Product.findById(product._id);
        expect(deletedProduct).toBeNull();
    });
});
