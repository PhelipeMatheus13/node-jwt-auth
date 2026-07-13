const { AsyncLocalStorage } = require("async_hooks");

// Single instance for the whole app
const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Runs `callback` inside a context that carries `store`.
 * Everything called inside (sync or async) can read `store` via getContext().
 */
const runWithContext = (store, callback) => {
    return asyncLocalStorage.run(store, callback);
};

/**
 * Returns the current context, or undefined if called outside runWithContext
 */
const getContext = () => {
    return asyncLocalStorage.getStore();
};

module.exports = {
    runWithContext,
    getContext,
};