const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const User = require("../models/user.model");
const Product = require("../models/product.model");
const Menu = require("../models/menu.model");
const Order = require("../models/order.model");

let mongoServer;
let adminToken;
let receptionToken;
let orderPickerToken;
let receptionUser;

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
    await Order.deleteMany();

    const admin = await User.create({
        name: "admin",
        email: "admin@test.com",
        password: "Password123",
        role: "admin",
    });

    receptionUser = await User.create({
        name: "reception",
        email: "reception@test.com",
        password: "Password123",
        role: "reception",
    });

    const orderPicker = await User.create({
        name: "order_picker",
        email: "picker@test.com",
        password: "Password123",
        role: "order_picker",
    });

    adminToken = createToken(admin);
    receptionToken = createToken(receptionUser);
    orderPickerToken = createToken(orderPicker);
});

describe("Orders routes", () => {
    it("should return 401 if user is not authenticated", async () => {
        const res = await request(app).get("/wacdo/orders");

        expect(res.statusCode).toBe(401);
    });

    it("should create an order and calculate totalPrice server side", async () => {
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
            .post("/wacdo/orders")
            .set("Authorization", `Bearer ${receptionToken}`)
            .send({
                products: [
                    {
                        product: product._id.toString(),
                        quantity: 2,
                    },
                ],
                menus: [
                    {
                        menu: menu._id.toString(),
                        quantity: 1,
                    },
                ],
                user: receptionUser._id.toString(),
                deliveryTime: new Date().toISOString(),
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.totalPrice).toBe(32.88);
        expect(res.body.products[0].unitPrice).toBe(9.99);
        expect(res.body.menus[0].unitPrice).toBe(12.9);
        expect(res.body.orderNumber).toBeDefined();
    });

    it("should return 400 if order has no products and no menus", async () => {
        const res = await request(app).post("/wacdo/orders").set("Authorization", `Bearer ${receptionToken}`).send({
            products: [],
            menus: [],
            user: receptionUser._id.toString(),
            deliveryTime: new Date().toISOString(),
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Produits, menus, utilisateur et heure de livraison obligatoires");
    });

    it("should prevent order_picker from updating deliveryTime", async () => {
        const product = await Product.create({
            name: "Big Wac",
            category: "burger",
            price: 9.99,
        });

        const order = await Order.create({
            orderNumber: "CMD-TEST-0001",
            products: [
                {
                    product: product._id,
                    quantity: 1,
                    unitPrice: 9.99,
                },
            ],
            menus: [],
            user: receptionUser._id,
            totalPrice: 9.99,
            deliveryTime: new Date(),
        });

        const res = await request(app)
            .put(`/wacdo/orders/${order._id}`)
            .set("Authorization", `Bearer ${orderPickerToken}`)
            .send({
                deliveryTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.error).toBe("Modification de l'heure de livraison refusée");
    });

    it("should allow order_picker to update status to prepared", async () => {
        const product = await Product.create({
            name: "Big Wac",
            category: "burger",
            price: 9.99,
        });

        const order = await Order.create({
            orderNumber: "CMD-TEST-0002",
            status: "in_preparation",
            products: [
                {
                    product: product._id,
                    quantity: 1,
                    unitPrice: 9.99,
                },
            ],
            menus: [],
            user: receptionUser._id,
            totalPrice: 9.99,
            deliveryTime: new Date(),
        });

        const res = await request(app)
            .put(`/wacdo/orders/${order._id}`)
            .set("Authorization", `Bearer ${orderPickerToken}`)
            .send({
                status: "prepared",
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("prepared");
    });

    it("should allow reception to mark an order as delivered", async () => {
        const product = await Product.create({
            name: "Big Wac",
            category: "burger",
            price: 9.99,
        });

        const order = await Order.create({
            orderNumber: "CMD-TEST-0003",
            status: "prepared",
            products: [
                {
                    product: product._id,
                    quantity: 1,
                    unitPrice: 9.99,
                },
            ],
            menus: [],
            user: receptionUser._id,
            totalPrice: 9.99,
            deliveryTime: new Date(),
        });

        const res = await request(app)
            .put(`/wacdo/orders/${order._id}`)
            .set("Authorization", `Bearer ${receptionToken}`)
            .send({
                status: "delivered",
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("delivered");
    });

    it("should prevent reception from setting status to prepared", async () => {
        const product = await Product.create({
            name: "Big Wac",
            category: "burger",
            price: 9.99,
        });

        const order = await Order.create({
            orderNumber: "CMD-TEST-0004",
            status: "in_preparation",
            products: [
                {
                    product: product._id,
                    quantity: 1,
                    unitPrice: 9.99,
                },
            ],
            menus: [],
            user: receptionUser._id,
            totalPrice: 9.99,
            deliveryTime: new Date(),
        });

        const res = await request(app)
            .put(`/wacdo/orders/${order._id}`)
            .set("Authorization", `Bearer ${receptionToken}`)
            .send({
                status: "prepared",
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.error).toBe("Changement de statut refusé");
    });

    it("should delete an order if user is admin", async () => {
        const product = await Product.create({
            name: "Big Wac",
            category: "burger",
            price: 9.99,
        });

        const order = await Order.create({
            orderNumber: "CMD-TEST-0005",
            products: [
                {
                    product: product._id,
                    quantity: 1,
                    unitPrice: 9.99,
                },
            ],
            menus: [],
            user: receptionUser._id,
            totalPrice: 9.99,
            deliveryTime: new Date(),
        });

        const res = await request(app)
            .delete(`/wacdo/orders/${order._id}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);

        const deletedOrder = await Order.findById(order._id);
        expect(deletedOrder).toBeNull();
    });
});
