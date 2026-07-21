/**
 *  @swagger
 *  components:
 *      schemas:
 *          Error:
 *              type: object
 *              properties:
 *                  success:
 *                      type: boolean
 *                      example: false
 *                  error:
 *                      type: object
 *                      properties:
 *                          code:
 *                              type: string
 *                              example: "ERROR_CODE"
 *                      message:
 *                          type: string
 *                          example: "Error description"
 *          LoginInput:
 *              type: object
 *              required: [email, password]
 *              properties:
 *                  email:
 *                      type: string
 *                      format: email
 *                  password:
 *                      type: string
 *                      format: password
 *          RegisterInput:
 *              type: object
 *              required: [name, email, password, confirmPassword]
 *              properties:
 *                  name:
 *                      type: string
 *                      format: name
 *                  email:
 *                      type: string
 *                      format: email
 *                  password:
 *                      type: string
 *                      format: password
 *                  confirmPassword:
 *                      type: string
 *                      format: confirmPassword
 *          AuthTokens:
 *              type: object
 *              properties:
 *                  accessToken:
 *                      type: string
 *                  refreshToken:
 *                      type: string
 *          User:
 *              type: object
 *              properties:
 *                  id:
 *                      type: string
 *                  name:
 *                      type: string
 *                  email:
 *                      type: string
 *                  role:
 *                      type: string
 *                  createdAt:
 *                      type: string
 *                  updatedAt:
 *                      type: string
 */