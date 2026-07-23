const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  	definition: {
    	openapi: "3.0.0",
		info: {
			title: "JWT Authentication API",
			version: "1.0.0",
			description: "Authentication API with JWT",
			contact: {
				name: "Phelipe Matheus",
				email: "phelipematheus134@gmail.com",
				url: "https://github.com/PhelipeMatheus13",
			},
		},
		servers: [
			{
				url: "http://localhost:3000",
				description: "Development server",
			},
		],
		tags: [
			{
				name: "Auth",
				description: "Authentication endpoints",
			},
			{
				name: "User",
				description: "User manegement",
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
    	"./src/shared/docs/components/*.yaml",
	], 
};

module.exports = swaggerJsdoc(options);