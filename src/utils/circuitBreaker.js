const { CIRCUIT_BREAKER } = require("../config/constants");

class CircuitBreaker {
  constructor() {
    this.failureCount = 0;
    this.state = "CLOSED";
    this.nextTry = Date.now();
  }

  async execute(pool, sql) {
    if (this.state === "OPEN") {
      if (Date.now() > this.nextTry) {
        this.state = "HALF";
      } else {
        console.error("Circuit Breaker está ABIERTO");
        throw new Error("Circuit Breaker Abierto");
      }
    }

    try {
      console.log(`Ejecutando query (Estado CB: ${this.state}, Intentos fallidos: ${this.failureCount})`);
      const [rows] = await pool.query(sql);
      this.failureCount = 0;
      this.state = "CLOSED";
      return rows;
    } catch (e) {
      console.error("Error en query:", e.message);
      console.error("Código de error:", e.code);
      this.failureCount++;
      if (this.failureCount >= CIRCUIT_BREAKER.MAX_FAILURES) {
        this.state = "OPEN";
        this.nextTry = Date.now() + CIRCUIT_BREAKER.RESET_TIME;
        console.error(`Circuit Breaker ABIERTO después de ${this.failureCount} fallos`);
      }
      throw e;
    }
  }
}

module.exports = new CircuitBreaker();
