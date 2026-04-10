const tokenService = require("../../services/tokenService");
const RefreshToken = require("../../models/RefreshToken");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");


let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("Token Service", () => {
    const userId = new mongoose.Types.ObjectId().toString();
    
    beforeEach(async () => {
        await RefreshToken.deleteMany({});
    });

    describe("generateAccessToken", () => {
        it("should generate a valid JWT access token", () => {
            const token = tokenService.generateAccessToken(userId);
            expect(token).toBeDefined();
            expect(typeof token).toBe("string");
            // Decode to view payload
            const decoded = require("jsonwebtoken").decode(token);
            expect(decoded.id).toBe(userId);
        });
    });

    describe("generateRefreshToken", () => {
        it("should generate and store a refresh token", async () => {
            const token = await tokenService.generateRefreshToken(userId);
            expect(token).toBeDefined();

            const stored = await RefreshToken.findOne({ token });
            expect(stored).toBeTruthy();
            expect(stored.userId.toString()).toBe(userId);
        });
    });

    describe("verifyRefreshToken", () => {
        it("should verify a valid refresh token", async () => {
            const token = await tokenService.generateRefreshToken(userId);
            const decoded = await tokenService.verifyRefreshToken(token);
            expect(decoded.id).toBe(userId);
        });

        it("should throw error for invalid token", async () => {
            await expect(tokenService.verifyRefreshToken("invalid.token.here"))
                .rejects.toThrow("Invalid or expired refresh token");
        });

        it("should throw error if token not in database", async () => {
            const jwt = require("jsonwebtoken");
            const secret = process.env.REFRESH_SECRET || process.env.SECRET;
            const token = jwt.sign({ id: userId }, secret, { expiresIn: "1h" });
            // don't save in the bank
            await expect(tokenService.verifyRefreshToken(token))
                .rejects.toThrow("Invalid or expired refresh token");
        });
    });

    describe("revokeRefreshToken", () => {
        it("should remove token from database", async () => {
            const token = await tokenService.generateRefreshToken(userId);
            await tokenService.revokeRefreshToken(token);
            const stored = await RefreshToken.findOne({ token });
            expect(stored).toBeNull();
        });
    });
});