const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  	definition: {
    	openapi: "3.0.0",
		info: {
			title: "JWT Authentication API",
			version: "1.0.0",
			description: "Authentication API with JWT",
		},
		servers: [
			{
				url: "http://localhost:3000",
				description: "Development server",
			},
		],
		components: {
			securitySchemes: {
				BearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
    	security: [{ BearerAuth: [] }],
  	},
  	apis: [
		"./src/modules/**/*.routes.js",
		"./src/shared/docs/components/*.docs.js",
	], 
};

module.exports = swaggerJsdoc(options);