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
 * @param {string} [tokens.refreshToken] - (optional) only include refreshToken if it's provided 
 * @returns {{ accessToken: string, refreshToken?: string }}
 */
const tokenOutputDTO = (tokens) => {
    const result = { accessToken: tokens.accessToken };
    if (tokens.refreshToken !== undefined) {
        result.refreshToken = tokens.refreshToken; 
    }
    return result;
};

module.exports = { loginInputDTO, tokenOutputDTO };