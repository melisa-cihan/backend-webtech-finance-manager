const express = require('express');
const cors = require('cors');
require('dotenv').config();
const routes = require('./routes');
const init = require('./initdb');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use('/init', init);
app.use('/', routes);
app.use('/assets', routes)


const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Manager API",
      version: "1.0.0",
      description: "API documentation for Finance Manager",
      contact: {
        name: "Melisa Cihan",
      }
    },
    servers: [
      {
        url: "http://localhost:3000", 
        description: "Local development server"
      }
    ]
  },
  apis: ["./routes.js"] 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

console.log("Swagger docs available at http://localhost:3000/api-docs");

app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`Server started and listening on port ${PORT} ...`);
    }
})