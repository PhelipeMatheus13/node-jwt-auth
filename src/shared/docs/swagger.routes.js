const express = require("express");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger.config");

const router = express.Router();

// Relaxed CSP only here: Swagger UI needs to load
// inline scripts/styles to render the documentation page.
router.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
        },
    })
);


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