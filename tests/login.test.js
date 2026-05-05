const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const app = require("../app");
const User = require("../models/user.model");

let mongoServer;

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
});

describe("POST /wacdo/users/login", () => {
    it("should return a token if identifiers are valid", async () => {
        const hashedPassword = await bcrypt.hash("Password123", 10);

        await User.create({
            name: "admin",
            email: "admin@test.com",
            password: hashedPassword,
            role: "admin",
        });

        const res = await request(app).post("/wacdo/users/login").send({
            email: "admin@test.com",
            password: "Password123",
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it("should return 401 if password is wrong", async () => {
        const hashedPassword = await bcrypt.hash("Password123", 10);

        await User.create({
            name: "admin",
            email: "admin@test.com",
            password: hashedPassword,
            role: "admin",
        });

        const res = await request(app).post("/wacdo/users/login").send({
            email: "admin@test.com",
            password: "wrongPassword",
        });

        expect(res.statusCode).toBe(401);
    });

    it("should return 401 if user doesn't exist", async () => {
        const res = await request(app).post("/wacdo/users/login").send({
            email: "unknown@test.com",
            password: "Password123",
        });

        expect(res.statusCode).toBe(401);
    });

    it("should return 400 if email is missing", async () => {
        const res = await request(app).post("/wacdo/users/login").send({
            password: "Password123",
        });

        expect(res.statusCode).toBe(400);
    });

    it("should return 400 if password is missing", async () => {
        const res = await request(app).post("/wacdo/users/login").send({
            email: "admin@test.com",
        });

        expect(res.statusCode).toBe(400);
    });
});
