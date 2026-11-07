const pool = require("../config/database");

class CatalogoRepository {
  async listarTags() {
    const [rows] = await pool.query("SELECT id_tag AS id, nome FROM tag ORDER BY nome");
    return rows;
  }
}

module.exports = new CatalogoRepository();