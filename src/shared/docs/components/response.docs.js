/** 
 *  @swagger
 *  components: 
 *      responses:
 *          BadRequest:
 *              description: Invalid request
 *              content:
 *                  application/json:
 *                      schema:
 *                          allOf:
 *                              - $ref: '#/components/schemas/Error'
 *                              - type: object
 *                                properties:
 *                                      error: 
 *                                          properties:
 *                                              code:
 *                                                  example: "BAD_REQUEST"
 *                                              message:
 *                                                  example: "Bad request"
 *          Unauthorized:
 *              description: Not authenticated or invalid token
 *              content:
 *                  application/json:
 *                      schema:
 *                          allOf:
 *                              - $ref: '#/components/schemas/Error'
 *                              - type: object
 *                                properties:
 *                                      error: 
 *                                          properties:
 *                                              code:
 *                                                  example: "UNAUTHORIZED"
 *                                              message:
 *                                                  example: "Authentication required"
 *          Forbidden:
 *              description: Access denied
 *              content:
 *                  application/json:
 *                      schema:
 *                          allOf:
 *                              - $ref: '#/components/schemas/Error'
 *                              - type: object
 *                                properties:
 *                                      error: 
 *                                          properties:
 *                                              code:
 *                                                  example: "FORBIDDEN"
 *                                              message:
 *                                                  example: "Access denied"
 *          NotFound:
 *              description: Resource not found or does not exist
 *              content:
 *                  application/json:
 *                      schema:
 *                          allOf:
 *                              - $ref: '#/components/schemas/Error'
 *                              - type: object
 *                                properties:
 *                                      error: 
 *                                          properties:
 *                                              code:
 *                                                  example: "NOT_FOUND"
 *                                              message:
 *                                                  example: "Resource not found"
 *          AlreadyExists:
 *              description: Resource already exists
 *              content:
 *                  application/json:
 *                      schema:
 *                          allOf:
 *                              - $ref: '#/components/schemas/Error'
 *                              - type: object
 *                                properties:
 *                                      error: 
 *                                          properties:
 *                                              code:
 *                                                  example: "ALREADY_EXISTS"
 *                                              message:
 *                                                  example: "Resource already exists"
 *          InternalError:
 *              description: Internal error
 *              content:
 *                  application/json:
 *                      schema:
 *                          allOf:
 *                              - $ref: '#/components/schemas/Error'
 *                              - type: object
 *                                properties:
 *                                      error: 
 *                                          properties:
 *                                              code:
 *                                                  example: "INTERNAL_ERROR"
 *                                              message:
 *                                                  example: "Internal server error"
 *          LoginValidationError:
 *              description: Login validation error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ValidationError'
 *                      example:
 *                          success: false
 *                          error:
 *                              code: "VALIDATION_ERROR"
 *                              message: "Validation failed"
 *                              details: [
 *                                  {"field":"email","message":"Please provide a valid email address"},
 *                                  {"field":"password","message":"Password is required"}
 *                              ]
 *          RegisterValidationError:
 *              description: Register validation error
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/ValidationError'
 *                      example:
 *                          success: false
 *                          error:
 *                              code: "VALIDATION_ERROR"
 *                              message: "Validation failed"
 *                              details: [
 *                                  {"field":"name","message":"Name is required"},
 *                                  {"field":"email","message":"Please provide a valid email address"},
 *                                  {"field":"password","message":"Password must contain at least one special character"},
 *                                  {"field":"confirmPassword","message":"Passwords do not match"}
 *                              ]
 */