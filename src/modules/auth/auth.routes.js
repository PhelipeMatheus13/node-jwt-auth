const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { validateLogin } = require("./auth.validators");

/**
 *  @swagger
 *  /auth/login:
 *      post:  
 *          tags: [Auth]
 *          summary: Authenticates the user and returns access tokens
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
 *                  $ref: '#/components/responses/Unauthorized'
 *              422:    
 *                  $ref: '#/components/responses/Unprocessable'
 *              500: 
 *                  $ref: '#/components/responses/InternalError'
 */
router.post("/login", validateLogin, authController.login);

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
 *                  $ref: '#/components/responses/BadRequest'
 *              401:
 *                  $ref: '#/components/responses/Unauthorized'
 *              500:
 *                  $ref: '#/components/responses/InternalError'
 */
router.post("/refresh", authController.refresh);

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
 *                  description: Logout successful, no content returned
 *              400:
 *                  $ref: '#/components/responses/BadRequest'
 *              401:
 *                  $ref: '#/components/responses/Unauthorized'
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
 *                  description: All sessions invalidated, no content returned
 *              400:
 *                  $ref: '#/components/responses/BadRequest'
 *              401:
 *                  $ref: '#/components/responses/Unauthorized'
 *              500:
 *                  $ref: '#/components/responses/InternalError'
 */
router.post("/logout-all", authController.logoutAll);

module.exports = router;