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
 *          Conflict:
 *              description: Resource conflict
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
 *                                                  example: "CONFLICT"
 *                                              message:
 *                                                  example: "Resource conflict"
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
 *          Unprocessable:
 *              description: validation error
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
 *                                                  example: "VALIDATION_ERROR"
 *                                              message:
 *                                                  example: "Validation failed"
 *                                              details:
 *                                                  type: array 
 *                                                  items:
 *                                                      type: object
 *                                                  example: [{"msg":"Name is required","param":"name","location":"body"}]                         
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
 */