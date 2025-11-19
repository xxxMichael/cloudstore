const pool = require("../config/database");
const circuitBreaker = require("../utils/circuitBreaker");

class ProductoRepository {
  async findAll() {

    console.log("Executing findAll query");
    return await circuitBreaker.execute(pool, "SELECT * FROM productos");

  }

  async findById(id) {
    const sql = `SELECT * FROM productos WHERE id = ${id}`;
    const rows = await circuitBreaker.execute(pool, sql);
    return rows[0];
  }

  async create(producto) {
    const { nombre, descripcion, precio, stock } = producto;
    const sql = `INSERT INTO productos (nombre, descripcion, precio, stock) VALUES ('${nombre}', '${descripcion}', ${precio}, ${stock})`;
    const result = await circuitBreaker.execute(pool, sql);
    return result;
  }

  async update(id, producto) {
    const { nombre, descripcion, precio, stock } = producto;
    const sql = `UPDATE productos SET nombre='${nombre}', descripcion='${descripcion}', precio=${precio}, stock=${stock} WHERE id=${id}`;
    const result = await circuitBreaker.execute(pool, sql);
    return result;
  }

  async delete(id) {
    const sql = `DELETE FROM productos WHERE id = ${id}`;
    const result = await circuitBreaker.execute(pool, sql);
    return result;
  }
}

module.exports = new ProductoRepository();
