const pool = require("../config/database");

class CatalogoRepository {
  async listarTags() {
    const [rows] = await pool.query("SELECT id_tag AS id, nome FROM tag ORDER BY nome");
    return rows;
  }

  async listarDisciplinas() {
    const [rows] = await pool.query("SELECT id_disciplina AS id, nome FROM disciplina ORDER BY nome");
    return rows;
  }

  async listarBimestres() {
    const [rows] = await pool.query(
      `SELECT b.id_bimestre AS id, b.numero, b.dt_abertura AS dataAbertura,
              b.dt_encerramento AS dataEncerramento, an.ano AS anoLetivo,
              (CURDATE() BETWEEN b.dt_abertura AND b.dt_encerramento) AS aberto
         FROM bimestre b
         JOIN ano_letivo an ON an.id_ano_letivo = b.id_ano_letivo
        ORDER BY an.ano DESC, b.numero`
    );
    return rows.map((row) => ({ ...row, aberto: !!row.aberto }));
  }

  async buscarBimestre(id) {
    const [rows] = await pool.query(
      `SELECT id_bimestre AS id, numero,
              (CURDATE() BETWEEN dt_abertura AND dt_encerramento) AS aberto
         FROM bimestre
        WHERE id_bimestre = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    return { ...rows[0], aberto: !!rows[0].aberto };
  }
}

module.exports = new CatalogoRepository();