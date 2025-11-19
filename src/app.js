const express = require("express");
const routes = require("./routes");
const cors = require("cors");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Rutas
app.use("/", routes);

module.exports = app;
