const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const {checkToken, authorize} = require("../../shared/middlewares/auth.middleware");
const { validateRegister } = require("./user.validators");

/**
 *  @swagger
 *  /users/register:
 *      post:
 *          tags: [User]
 *          summary: Registers a new user
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/RegisterInput'
 *          responses:
 *              201:
 *                  description: User created successfully
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  success:
 *                                      type: boolean
 *                                      example: true
 *                                  data:
 *                                      $ref: '#/components/schemas/User'
 *              409:
 *                  description: email already in use
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *                          example:
 *                              success: false
 *                              error:
 *                                  code: "ALREADY_EXISTS"
 *                                  message: "Email already in use, please choose another"
 *              422:    
 *                   $ref: '#/components/responses/RegisterValidationError'
 *              500:
 *                  $ref: '#/components/responses/InternalError'
 */
router.post("/register", validateRegister, userController.register);

/**
 *  @swagger
 *  /users/{id}:
 *      get:
 *          tags: [User]
 *          summary: Retrieves a user by id
 *          security:
 *              - BearerAuth: []
 *          parameters:
 *              - name: id
 *                in: path
 *                required: true
 *                schema:
 *                    type: string
 *          responses:
 *              200:
 *                  description: User retrieved successfully
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  success:
 *                                      type: boolean
 *                                      example: true
 *                                  data:
 *                                      $ref: '#/components/schemas/User'
 *              400: 
 *                  $ref: '#/components/responses/MissingUserIdError'
 *              401:    
 *                  $ref: '#/components/responses/UserAuthenticationError'
 *              403:
 *                  description: Access denied
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *                          example:
 *                              success: false
 *                              error:
 *                                  code: "FORBIDDEN"
 *                                  message: "You can only access your own data"
 *              404:
 *                  $ref: '#/components/responses/UserNotFoundError'
 *              500:
 *                  $ref: '#/components/responses/InternalError'
 */
router.get("/:id", checkToken, authorize("admin", "user"), userController.getUser);

/**
 *  @swagger
 *  /users/{id}:
 *      delete:
 *          tags: [User]
 *          summary: Deletes a user by id
 *          security:
 *              - BearerAuth: []
 *          parameters:
 *              - name: id
 *                in: path
 *                required: true
 *                schema:
 *                    type: string
 *          responses:
 *              200:
 *                  description: User deleted successfully, no content returned
 *              400: 
 *                  $ref: '#/components/responses/MissingUserIdError'
 *              401:
 *                  $ref: '#/components/responses/UserAuthenticationError'
 *              403:
 *                  description: Access denied
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Error'
 *                          example:
 *                              success: false
 *                              error:
 *                                  code: "FORBIDDEN"
 *                                  message: "You can only delete your own account"
 *              404:
 *                  $ref: '#/components/responses/UserNotFoundError'
 *              500:
 *                  $ref: '#/components/responses/InternalError'
 */
router.delete("/:id", checkToken, authorize("admin", "user"), userController.deleteUser);

module.exports = router;