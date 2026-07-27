const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { validateLogin } = require("./auth.validators");
const { loginLimiter, refreshLimiter } = require("../../shared/middlewares/rate-limiter.middleware");

/**
 *  @swagger
 *  /auth/login:
 *      post:  
 *          tags: [Auth]
 *          summary: Authenticates the user and returns a access token and an refresh token
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/LoginInput'
 *          responses:
 *              200:
 *                  description: Login successful
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  success:
 *                                      type: boolean
 *                                      example: true
 *                                  data: 
 *                                      $ref: '#/components/schemas/AuthTokens'
 *              401: 
 *                  description: Authentication failed
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *                          example:
 *                              success: false
 *                              error:
 *                                  code: "INVALID_CREDENTIALS"
 *                                  message: "Invalid email or password"
 *              422:    
 *                   $ref: '#/components/responses/LoginValidationError'
 *              500: 
 *                  $ref: '#/components/responses/InternalError'
 */
router.post("/login", loginLimiter, validateLogin, authController.login);

/**
 *  @swagger
 *  /auth/refresh:
 *      post:
 *          tags: [Auth]
 *          summary: Generates a new access token and refresh token using a valid refresh token
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required: [refreshToken]
 *                          properties:
 *                              refreshToken:
 *                                  type: string
 *          responses:
 *              200:
 *                  description: Tokens refreshed successfully
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  success:
 *                                      type: boolean
 *                                      example: true
 *                                  data:
 *                                      $ref: '#/components/schemas/AuthTokens'
 *              400:
 *                  $ref: '#/components/responses/MissingRefreshTokenError'
 *              401:
 *                  description: Authentication failed
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *                          examples:
 *                              RefreshTokenExpired:
 *                                  $ref: '#/components/examples/RefreshTokenExpired'
 *                              InvalidRefreshToken:
 *                                  $ref: '#/components/examples/InvalidRefreshToken'
 *                              tokenNotFound:
 *                                  $ref: '#/components/examples/TokenNotFound'
 *                              tokenReuseDetected:
 *                                  $ref: '#/components/examples/TokenReuseDetected'
 *              500:
 *                  $ref: '#/components/responses/InternalError'
 */
router.post("/refresh", refreshLimiter, authController.refresh);

/**
 *  @swagger
 *  /auth/logout:
 *      post:
 *          tags: [Auth]
 *          summary: Invalidates the current session's refresh token
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required: [refreshToken]
 *                          properties:
 *                              refreshToken:
 *                                  type: string
 *          responses:
 *              200:
 *                  description: Logout successful, session revoked
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  success:
 *                                      type: boolean
 *                                      example: true
 *                                  message: 
 *                                      type: string
 *                                      example: "Logged out successfully"
 *              400: 
 *                  $ref: '#/components/responses/MissingRefreshTokenError'
 *              401:
 *                  description: Authentication failed
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *                          examples:
 *                              RefreshTokenExpired:
 *                                  $ref: '#/components/examples/RefreshTokenExpired'
 *                              InvalidRefreshToken:
 *                                  $ref: '#/components/examples/InvalidRefreshToken'
 *                              tokenNotFound:
 *                                  $ref: '#/components/examples/TokenNotFound'
 *              500:
 *                  $ref: '#/components/responses/InternalError'
 */
router.post("/logout", authController.logout);

/**
 *  @swagger
 *  /auth/logout-all:
 *      post:
 *          tags: [Auth]
 *          summary: Invalidates all active sessions for the authenticated user
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required: [refreshToken]
 *                          properties:
 *                              refreshToken:
 *                                  type: string
 *          responses:
 *              200:
 *                  description: Logout-all successful, all sessions revoked
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  success:
 *                                      type: boolean
 *                                      example: true
 *                                  message: 
 *                                      type: string
 *                                      example: "Logged out from all devices"
 *              400: 
 *                  $ref: '#/components/responses/MissingRefreshTokenError'
 *              401:
 *                  description: Authentication failed
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *                          examples:
 *                              RefreshTokenExpired:
 *                                  $ref: '#/components/examples/RefreshTokenExpired'
 *                              InvalidRefreshToken:
 *                                  $ref: '#/components/examples/InvalidRefreshToken'
 *                              tokenNotFound:
 *                                  $ref: '#/components/examples/TokenNotFound'
 *                              tokenReuseDetected:
 *                                  $ref: '#/components/examples/TokenReuseDetected'
 *              500:
 *                  $ref: '#/components/responses/InternalError'
 */
router.post("/logout-all", authController.logoutAll);

module.exports = router;