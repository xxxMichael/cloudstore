require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());

const SECRET = "secretito123";

// ------- CIRCUIT BREAKER -------
let failureCount = 0;
let state = "CLOSED";
const MAX_FAIL = 3;
const RESET_TIME = 10000;
let nextTry = Date.now();

// MySQL pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  database: "cloudstore"
});

// JWT Login
app.post("/auth/login", (req, res) => {
  const token = jwt.sign({ user: "admin" }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Middleware JWT
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).json({ error: "Token inválido" });
  }
}

// Circuit Breaker función DB
async function dbQuery(sql) {
  if (state === "OPEN") {
    if (Date.now() > nextTry) state = "HALF";
    else throw new Error("Circuit Breaker Abierto");
  }

  try {
    const [rows] = await pool.query(sql);
    failureCount = 0;
    state = "CLOSED";
    return rows;
  } catch (e) {
    failureCount++;
    if (failureCount >= MAX_FAIL) {
      state = "OPEN";
      nextTry = Date.now() + RESET_TIME;
    }
    throw e;
  }
}

// Ruta protegida
app.get("/productos", verifyToken, async (req, res) => {
  try {
   
    const productos = await dbQuery("SELECT * FROM productos");
    
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: "Error DB o Circuit Breaker" });
  }
});

app.listen(3000, () => console.log("API corriendo en el puerto 3000"));