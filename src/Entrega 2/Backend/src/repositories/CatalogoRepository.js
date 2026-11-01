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

  async listarTurmas() {
    const [rows] = await pool.query(
      `SELECT t.id_turma AS id, t.nome, t.serie, an.ano AS anoLetivo
         FROM turma t
         JOIN ano_letivo an ON an.id_ano_letivo = t.id_ano_letivo
        ORDER BY an.ano DESC, t.nome`
    );
    return rows;
  }

  async listarBimestres() {
    const [rows] = await pool.query(
      `SELECT b.id_bimestre AS id, b.numero, b.dt_abertura AS dataAbertura,
              b.dt_encerramento AS dataEncerramento, an.ano AS anoLetivo
         FROM bimestre b
         JOIN ano_letivo an ON an.id_ano_letivo = b.id_ano_letivo
        ORDER BY an.ano DESC, b.numero`
    );
    return rows;
  }
}

module.exports = new CatalogoRepository();