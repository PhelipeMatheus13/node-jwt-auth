const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger.config");

const router = express.Router();

// Provides access to the static files for Swagger UI (CSS, JS, images...)
router.use("/", swaggerUi.serve);
// Renders the documentation page using the generated OpenAPI specification
router.get("/", swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
        // hides the footer schemas on the documentation servers
        defaultModelsExpandDepth: -1, 
    },
}));

module.exports = router;