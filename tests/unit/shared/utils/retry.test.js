const { withRetry } = require("../../../../src/shared/utils/retry");

describe("Retry (unit)", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should return the result on the first attempt without retrying", async () => {
        const fn = jest.fn().mockResolvedValue("success");

        const result = await withRetry(fn);

        expect(result).toBe("success");
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should retry and succeed after failing on earlier attempts", async () => {
        const fn = jest.fn()
            .mockRejectedValueOnce(new Error("fail 1"))
            .mockRejectedValueOnce(new Error("fail 2"))
            .mockResolvedValueOnce("success");

        const promise = withRetry(fn, { delayMs: 1000, backoff: 2 });

        await jest.advanceTimersByTimeAsync(1000);
        await jest.advanceTimersByTimeAsync(2000);

        const result = await promise;

        expect(result).toBe("success");
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should throw the last error after exhausting all attempts", async () => {
        const errorAttempt1 = new Error("fail 1");
        const errorAttempt2 = new Error("fail 2");
        const lastError = new Error("fail 3");

        const fn = jest.fn()
            .mockRejectedValueOnce(errorAttempt1)
            .mockRejectedValueOnce(errorAttempt2)
            .mockRejectedValueOnce(lastError);

        const promise = withRetry(fn, { maxAttempts: 3, delayMs: 1000, backoff: 2 });
        const assertion = expect(promise).rejects.toThrow(lastError);

        await jest.advanceTimersByTimeAsync(1000);
        await jest.advanceTimersByTimeAsync(2000);

        await assertion;
        expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should apply exponential backoff between attempts", async () => {
        const fn = jest.fn()
            .mockRejectedValueOnce(new Error("fail 1"))
            .mockRejectedValueOnce(new Error("fail 2"))
            .mockResolvedValueOnce("success");

        const promise = withRetry(fn, { delayMs: 1000, backoff: 2 });

        expect(fn).toHaveBeenCalledTimes(1);

        await jest.advanceTimersByTimeAsync(1000); // Advance time by 1000ms for the first retry
        expect(fn).toHaveBeenCalledTimes(2);

        await jest.advanceTimersByTimeAsync(1999); // 1999ms to account for the 2nd attempt's delay (1000ms * 2)
        expect(fn).toHaveBeenCalledTimes(2);

        await jest.advanceTimersByTimeAsync(1); // Complete the 2000ms delay for the 2nd attempt
        expect(fn).toHaveBeenCalledTimes(3);

        await promise;
    });

    it("should respect a custom maxAttempts value", async () => {
        const fn = jest.fn().mockRejectedValue(new Error("always fails"));

        const promise = withRetry(fn, { maxAttempts: 5, delayMs: 100, backoff: 2 });
        const assertion = expect(promise).rejects.toThrow("always fails");

        await jest.advanceTimersByTimeAsync(100);
        await jest.advanceTimersByTimeAsync(200);
        await jest.advanceTimersByTimeAsync(400);
        await jest.advanceTimersByTimeAsync(800);

        await assertion;
        expect(fn).toHaveBeenCalledTimes(5);
    });

    it("should not sleep after the last attempt fails", async () => {
        const fn = jest.fn().mockRejectedValue(new Error("fail"));

        const promise = withRetry(fn, { maxAttempts: 1, delayMs: 5000 });

        await expect(promise).rejects.toThrow("fail");
        expect(fn).toHaveBeenCalledTimes(1);
    });
});