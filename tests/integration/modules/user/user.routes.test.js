const request = require("supertest");
const app = require("../../../../src/app");
const { setupTestDatabase } = require("../../../helpers/testDatabase");
const { setKnexInstance } = require("../../../../src/shared/config/database");
const jwtService = require("../../../../src/modules/auth/services/jwt.service");

describe("User Routes (Integration)", () => {
    let db, knex, userId, accessToken;

    beforeAll(async () => {
        db = await setupTestDatabase({ migrationDirectory: "./database/migrations" });
        knex = db.knex;
        setKnexInstance(knex);
    });

    afterAll(async () => {
        await db.stop();
    });

    beforeEach(async () => {
        await knex("refresh_tokens").del();
        await knex("users").del();

        const [user] = await knex("users").insert({
            name: "Test User",
            email: "test@example.com",
            password: "hashedpass"
        })
        .returning("*");

        userId = user.id;
        accessToken = jwtService.generateAccessToken(userId);
    });

    describe("GET /users/:id", () => {
        it("should return user data with valid token", async () => {
            const res = await request(app)
                .get(`/users/${userId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toMatchObject({
                id: userId,
                name: "Test User",
                email: "test@example.com"
            });
            expect(res.body.password).toBeUndefined();
        });

        it("should return 401 when no token is provided (middleware failure)", async () => {
            const res = await request(app).get(`/users/${userId}`);
            expect(res.statusCode).toBe(401);
            expect(res.body.msg).toBe("Access denied");
        });
    });
});