const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const User = require("../models/user.model");

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

describe("Users routes", () => {
    it("should return 401 if user is not authenticated", async () => {
        const res = await request(app).get("/wacdo/users");

        expect(res.statusCode).toBe(401);
    });

    it("should return 403 if user is not admin", async () => {
        const res = await request(app).get("/wacdo/users").set("Authorization", `Bearer ${receptionToken}`);

        expect(res.statusCode).toBe(403);
    });

    it("should get a user by id if requester is admin", async () => {
        const user = await User.create({
            name: "test user",
            email: "test@test.com",
            password: "Password123",
            role: "reception",
        });

        const res = await request(app).get(`/wacdo/users/${user._id}`).set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("test user");
        expect(res.body.email).toBe("test@test.com");
        expect(res.body.password).toBeUndefined();
    });

    it("should return 403 if non-admin tries to get a user by id", async () => {
        const user = await User.create({
            name: "test user",
            email: "test@test.com",
            password: "Password123",
            role: "reception",
        });

        const res = await request(app).get(`/wacdo/users/${user._id}`).set("Authorization", `Bearer ${receptionToken}`);

        expect(res.statusCode).toBe(403);
    });

    it("should create a user if requester is admin", async () => {
        const res = await request(app).post("/wacdo/users").set("Authorization", `Bearer ${adminToken}`).send({
            name: "picker",
            email: "picker@test.com",
            password: "Password123",
            role: "order_picker",
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe("picker");
        expect(res.body.email).toBe("picker@test.com");
        expect(res.body.role).toBe("order_picker");
        expect(res.body.password).toBeUndefined();
    });

    it("should return 400 if email already exists", async () => {
        const res = await request(app).post("/wacdo/users").set("Authorization", `Bearer ${adminToken}`).send({
            name: "duplicate",
            email: "admin@test.com",
            password: "Password123",
            role: "admin",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe("Compte déjà existant");
    });

    it("should return 400 if password is not strong enough", async () => {
        const res = await request(app).post("/wacdo/users").set("Authorization", `Bearer ${adminToken}`).send({
            name: "weak",
            email: "weak@test.com",
            password: "password",
            role: "reception",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre");
    });

    it("should get all users if requester is admin", async () => {
        const res = await request(app).get("/wacdo/users").set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0].password).toBeUndefined();
    });

    it("should update a user if requester is admin", async () => {
        const user = await User.create({
            name: "old name",
            email: "old@test.com",
            password: "Password123",
            role: "reception",
        });

        const res = await request(app)
            .put(`/wacdo/users/${user._id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "new name",
                role: "order_picker",
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("new name");
        expect(res.body.role).toBe("order_picker");
        expect(res.body.password).toBeUndefined();
    });

    it("should delete a user if requester is admin", async () => {
        const user = await User.create({
            name: "to delete",
            email: "delete@test.com",
            password: "Password123",
            role: "reception",
        });

        const res = await request(app).delete(`/wacdo/users/${user._id}`).set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);

        const deletedUser = await User.findById(user._id);
        expect(deletedUser).toBeNull();
    });
});
