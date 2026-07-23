/**
 *  @swagger
 *  components:
 *      examples:
 *          InvalidCredentials:
 *              summary: Invalid email or password
 *              value:
 *                  success: false
 *                  error:
 *                      code: "INVALID_CREDENTIALS"
 *                      message: "Invalid email or password"
 *          TokenExpired:
 *              summary: Access or refresh token expired
 *              value:
 *                  success: false
 *                  error:
 *                      code: "TOKEN_EXPIRED"
 *                      message: "Refresh token expired"
 *          InvalidToken:
 *              summary: Malformed or tampered token
 *              value:
 *                  success: false
 *                  error:
 *                      code: "INVALID_TOKEN"
 *                      message: "Invalid refresh token"
 *          TokenNotFound:
 *              summary: Token not found in database
 *              value:
 *                  success: false
 *                  error:
 *                      code: "TOKEN_NOT_FOUND"
 *                      message: "Refresh token not found"
 *          TokenReuseDetected:
 *              summary: Refresh token reuse detected, all sessions revoked
 *              value:
 *                  success: false
 *                  error:
 *                      code: "TOKEN_REUSE_DETECTED"
 *                      message: "Refresh token reuse detected"
 */