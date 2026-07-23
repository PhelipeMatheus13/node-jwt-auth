const hashService = require("../../../../src/shared/services/hash.service");
const bcrypt = require("bcrypt");

jest.mock("bcrypt");

describe("Hash Service (Unit)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("hashPassword", () => {
        it("should hash", async () => {
            bcrypt.genSalt.mockResolvedValue("salt");
            bcrypt.hash.mockResolvedValue("hashed");

            const result = await hashService.hashPassword("password");

            expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
            expect(bcrypt.hash).toHaveBeenCalledWith("password", "salt");
            expect(result).toBe("hashed");
        });

        it("should throw internal error if bcrypt hashing fails", async () => {
            bcrypt.genSalt.mockRejectedValue(new Error("bcrypt error"));

            await expect(hashService.hashPassword("plain")).rejects.toMatchObject({
                statusCode: 500,
                code: "INTERNAL_ERROR",
                message: "Internal server error",
            });
        });
    });

    describe("comparePassword", () => {
        it("should return true if passwords match", async () => {
            bcrypt.compare.mockResolvedValue(true);

            const result = await hashService.comparePassword("password", "hash");
            
            expect(bcrypt.compare).toHaveBeenCalledWith("password", "hash");
            expect(result).toBe(true);
        });

        it("should return false if passwords do not match", async () => {
            bcrypt.compare.mockResolvedValue(false);

            const result = await hashService.comparePassword("password", "hash");
            
            expect(bcrypt.compare).toHaveBeenCalledWith("password", "hash");
            expect(result).toBe(false);
        });

        it("should throw internal error if bcrypt compare fails", async () => {
            bcrypt.compare.mockRejectedValue(new Error("bcrypt error"));

            await expect(hashService.comparePassword("password", "hash")).rejects.toMatchObject({
                statusCode: 500,
                code: "INTERNAL_ERROR",
                message: "Internal server error",
            });
        });
    });
});