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
 *                  $ref: '#/components/responses/AlreadyExists'
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
 *              401:
 *                  $ref: '#/components/responses/Unauthorized'
 *              403:
 *                  $ref: '#/components/responses/Forbidden'
 *              404:
 *                  $ref: '#/components/responses/NotFound'
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
 *              401:
 *                  $ref: '#/components/responses/Unauthorized'
 *              403:
 *                  $ref: '#/components/responses/Forbidden'
 *              404:
 *                  $ref: '#/components/responses/NotFound'
 *              500:
 *                  $ref: '#/components/responses/InternalError'
 */
router.delete("/:id", checkToken, authorize("admin", "user"), userController.deleteUser);

module.exports = router;