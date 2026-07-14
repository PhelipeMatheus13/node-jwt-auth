const requestContext = require('../../../../src/shared/utils/request-context');
const requestContextMiddleware = require('../../../../src/shared/middlewares/request-context.middleware');

jest.mock('../../../../src/shared/utils/request-context');

describe("request-context.middleware (Unit)", () => {
    describe("requestContextMiddleware", () => {
        it("calls runWithContext with the request id and delegates to next", () => {
            const req = { id: 'req-1' };
            const res = {};
            const next = jest.fn();

            requestContext.runWithContext.mockImplementation((store, callback) => callback());

            requestContextMiddleware(req, res, next);

            expect(requestContext.runWithContext).toHaveBeenCalledWith({ requestId: 'req-1' }, next);
            expect(next).toHaveBeenCalledTimes(1);
        });
    });
});