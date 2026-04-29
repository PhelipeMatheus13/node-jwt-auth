const hashService = require("../../../../src/shared/services/hash.service");
const bcrypt = require("bcrypt");

jest.mock("bcrypt");

describe("Hash Service (Unit)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should hash", async () => {
        bcrypt.genSalt.mockResolvedValue("salt");
        bcrypt.hash.mockResolvedValue("hashed");

        const result = await hashService.hash("plain");

        expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
        expect(bcrypt.hash).toHaveBeenCalledWith("plain", "salt");
        expect(result).toBe("hashed");
    });

    it("should compare", async () => {
        bcrypt.compare.mockResolvedValue(true);

        const result = await hashService.compare("plain", "hash");
        expect(bcrypt.compare).toHaveBeenCalledWith("plain", "hash");
        expect(result).toBe(true);
    });
});