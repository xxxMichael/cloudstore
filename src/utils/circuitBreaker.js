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
        throw new Error("Circuit Breaker Abierto");
      }
    }

    try {
      const [rows] = await pool.query(sql);
      this.failureCount = 0;
      this.state = "CLOSED";
      return rows;
    } catch (e) {
      this.failureCount++;
      if (this.failureCount >= CIRCUIT_BREAKER.MAX_FAILURES) {
        this.state = "OPEN";
        this.nextTry = Date.now() + CIRCUIT_BREAKER.RESET_TIME;
      }
      throw e;
    }
  }
}

module.exports = new CircuitBreaker();
