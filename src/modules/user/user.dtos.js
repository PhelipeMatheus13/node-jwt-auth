/**
 * @param {Object} body - body of the request
 * @param {string} body.name 
 * @param {string} body.email 
 * @param {string} body.password 
 * @returns {{ name: string, email: string, password: string }}
 */
const registerInputDTO = (body) => ({
    name: body.name,
    email: body.email,
    password: body.password,
});

/**
 * @param {Object} user - User returned by the repository
 * @param {string} user.id
 * @param {string} user.name
 * @param {string} user.email
 * @param {string} user.created_at
 * @param {string} user.updated_at
 * @returns {{ id: string, name: string, email: string, createdAt: string, updatedAt: string }}
 */
const userOutputDTO = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
});

module.exports = {
    registerInputDTO,
    userOutputDTO,
}