const swaggerJsDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Wacdo",
            version: "1.0.0",
            description:
                "Documentation de l'API permettant de gérer les utilisateurs, les produits, les menus et les commandes",
        },
        servers: [{ url: "https://wacdo-backend.vercel.app" }, { url: "http://localhost:5000" }],
    },
    apis: [path.join(__dirname, "routes/*.js")],
};

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app) => {
    app.get("/api-docs.json", (req, res) => {
        res.status(200).json(swaggerSpec);
    });

    app.get(["/api-docs", "/api-docs/"], (req, res) => {
        res.send(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8" />
                <title>API Wacdo - Documentation</title>
                <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
            </head>
            <body>
                <div id="swagger-ui"></div>
                <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
                <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
                <script>
                    window.onload = () => {
                        SwaggerUIBundle({
                            url: "/api-docs.json",
                            dom_id: "#swagger-ui",
                            presets: [
                                SwaggerUIBundle.presets.apis,
                                SwaggerUIStandalonePreset
                            ],
                            layout: "StandaloneLayout"
                        });
                    };
                </script>
            </body>
            </html>
        `);
    });
};

module.exports = setupSwagger;
