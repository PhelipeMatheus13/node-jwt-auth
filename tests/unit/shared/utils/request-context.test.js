const requestContext = require('../../../../src/shared/utils/request-context');

describe("request-context (Unit)", () => {
    describe("runWithContext", () => {
        it("should run the callback with the provided context", () => {
            const store = { requestId: 'abc-123' };

            requestContext.runWithContext(store, () => {
                expect(requestContext.getContext()).toEqual(store);
            });
        });

        it("should propagate the context via asynchronous operations", async () => {
            const store = { requestId: 'async-456' };

            await requestContext.runWithContext(store, async () => {
                await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async operation
                expect(requestContext.getContext()).toEqual(store);
            });
        });
    });

    describe("getContext", () => {
        it("returns undefined when called outside any context", () => {
            expect(requestContext.getContext()).toBeUndefined();
        });
    });
});