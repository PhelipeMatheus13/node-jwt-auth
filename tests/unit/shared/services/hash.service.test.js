const hashService = require("../../../../src/shared/services/hash.service");
const bcrypt = require("bcrypt");

jest.mock("bcrypt");

describe("Hash Service (Unit)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("hash", () => {
        it("should hash", async () => {
            bcrypt.genSalt.mockResolvedValue("salt");
            bcrypt.hash.mockResolvedValue("hashed");

            const result = await hashService.hash("plain");

            expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
            expect(bcrypt.hash).toHaveBeenCalledWith("plain", "salt");
            expect(result).toBe("hashed");
        });

        it("should throw internal error if bcrypt hashing fails", async () => {
            bcrypt.genSalt.mockRejectedValue(new Error("bcrypt error"));

            await expect(hashService.hash("plain")).rejects.toMatchObject({
                statusCode: 500,
                code: "INTERNAL_ERROR",
                message: "Failed to process hash",
            });
        });
    });

    describe("compare", () => {
        it("should compare", async () => {
            bcrypt.compare.mockResolvedValue(true);

            const result = await hashService.compare("plain", "hash");
            expect(bcrypt.compare).toHaveBeenCalledWith("plain", "hash");
            expect(result).toBe(true);
        });

        it("should throw internal error if bcrypt compare fails", async () => {
            bcrypt.compare.mockRejectedValue(new Error("bcrypt error"));

            await expect(hashService.compare("plain", "hash")).rejects.toMatchObject({
                statusCode: 500,
                code: "INTERNAL_ERROR",
                message: "Failed to compare hash",
            });
        });
    });
});