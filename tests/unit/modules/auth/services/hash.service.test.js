const hashService = require("../../../../../src/modules/auth/services/hash.service");
const bcrypt = require("bcrypt");

jest.mock("bcrypt");

describe("Hash Service (Unit)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should hash password", async () => {
        bcrypt.genSalt.mockResolvedValue("salt");
        bcrypt.hash.mockResolvedValue("hashed");

        const result = await hashService.hashPassword("plain");

        expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
        expect(bcrypt.hash).toHaveBeenCalledWith("plain", "salt");
        expect(result).toBe("hashed");
    });

    it("should compare password", async () => {
        bcrypt.compare.mockResolvedValue(true);

        const result = await hashService.comparePassword("plain", "hash");
        expect(bcrypt.compare).toHaveBeenCalledWith("plain", "hash");
        expect(result).toBe(true);
    });
});