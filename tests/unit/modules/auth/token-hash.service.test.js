const tokenHashService = require("../../../../src/modules/auth/token-hash.service.js");
const crypto = require("crypto");

jest.mock("crypto");

describe("Token hash service (Unit)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("hashToken", () => {
        it("should hash a token using sha256 and return hex digest", () => {
            const mockHashToken = {
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue("hashedTokenHex"),
            };
            crypto.createHash.mockReturnValue(mockHashToken);

            const result = tokenHashService.hashToken("myToken");

            expect(crypto.createHash).toHaveBeenCalledWith("sha256");
            expect(mockHashToken.update).toHaveBeenCalledWith("myToken");
            expect(mockHashToken.digest).toHaveBeenCalledWith("hex");
            expect(result).toBe("hashedTokenHex");
        });
    });

    describe("compareToken", () => {
        it("should return true if the computed hash matches the stored hash", () => {
            const tokenHash = "tokenHash";
            
            const mockHashToken = {
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue(tokenHash),
            };

            crypto.createHash.mockReturnValue(mockHashToken);
            crypto.timingSafeEqual.mockReturnValue(true);

            const result = tokenHashService.compareToken("myToken", tokenHash);

            expect(result).toBe(true);
            expect(crypto.timingSafeEqual).toHaveBeenCalledWith(
                Buffer.from(tokenHash),
                Buffer.from(tokenHash)
            );
        });

        it("should return false if the computed hash differs from the stored hash", () => {
            const tokenHash = "tokenHash";
            const fakeHash = "fakeHash";
            const mockHash = {
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue(tokenHash),
            };
            crypto.createHash.mockReturnValue(mockHash);
            crypto.timingSafeEqual.mockReturnValue(false);

            const result = tokenHashService.compareToken("token", fakeHash);

            expect(result).toBe(false);
            expect(crypto.timingSafeEqual).toHaveBeenCalledWith(
                Buffer.from(tokenHash),
                Buffer.from(fakeHash)
            );
        });

        it("should throw internal error if crypto.timingSafeEqual fails", () => {
            const tokenHash = "tokenHash";
            const fakeHash = "fakeHash";
            const mockHash = {
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue(tokenHash),
            };
            crypto.createHash.mockReturnValue(mockHash);

            crypto.timingSafeEqual.mockImplementation(() => {
                throw new Error("crypto error");;
            });

            expect(() => tokenHashService.compareToken("token", fakeHash)).toThrow(
                expect.objectContaining({
                    statusCode: 500,
                    code: "INTERNAL_ERROR",
                    message: "Internal server error",
                })
            );
        });
    });
});