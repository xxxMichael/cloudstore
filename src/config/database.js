const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  database: "cloudstore",
  ssl: {
    rejectUnauthorized: false // Para Azure MySQL
  },
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 60000 // 60 segundos
});

// Manejo de errores del pool
pool.on('error', (err) => {
  console.error('Error en el pool de conexiones:', err);
});

module.exports = pool;
