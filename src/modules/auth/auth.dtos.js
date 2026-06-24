/**
 * @param {Object} body - body of the request
 * @param {string} body.email
 * @param {string} body.password
 * @returns {{ email: string, password: string }}
 */
const loginInputDTO = (body) => ({
    email: body.email,
    password: body.password,
});

/**
 * @param {Object} tokens
 * @param {string} tokens.accessToken
 * @param {string} tokens.refreshToken
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const tokenOutputDTO = (tokens) => {
    const result = { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
    return result;
};

module.exports = { loginInputDTO, tokenOutputDTO };