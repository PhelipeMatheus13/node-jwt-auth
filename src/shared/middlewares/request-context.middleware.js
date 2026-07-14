const { runWithContext } = require("../utils/request-context");

/**
 * Requires req.id to already be set.
 * next() must be called INSIDE the run() callback, or the context won't propagate.
 */
const requestContextMiddleware = (req, res, next) => {
    runWithContext({ 
        requestId: req.id,
    }, next);
};

module.exports = requestContextMiddleware;