// Delays execution asynchronously without blocking the event loop
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes an async function with retry and exponential backoff.
 * Intermediate failures are silent — only the last error (after exhausting
 * all attempts) is thrown, so the caller decides how/whether to log it.
 *
 * @template T
 * @param {() => Promise<T>} fn - Async function to execute.
 * @param {Object} [options]
 * @param {number} [options.maxAttempts=3] - Total number of attempts (not retries after the first).
 * @param {number} [options.delayMs=1000] - Initial delay in ms before the first retry.
 * @param {number} [options.backoff=2] - Multiplier applied to the delay after each failed attempt.
 * @returns {Promise<T>} Resolves with fn's result on success.
 * @throws Re-throws the error from the last attempt if all attempts fail.
 */
const withRetry = async (fn, options = {}) => {
    const {
        maxAttempts = 3,
        delayMs = 1000,
        backoff = 2,
    } = options;

    let currentDelay = delayMs;
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt < maxAttempts) {
                await sleep(currentDelay);
                currentDelay = currentDelay * backoff;
            }
        }
    }

    throw lastError;
}

module.exports = {
    withRetry,
};