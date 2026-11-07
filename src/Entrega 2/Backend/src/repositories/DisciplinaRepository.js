const pool = require("../config/database");

// SELECT comum: disciplina no formato da API ({ id, nome, codigo, idArea, area })
const SQL_DISCIPLINA = `
  SELECT d.id_disciplina AS id, d.nome, d.codigo, d.id_area AS idArea, a.nome AS area
    FROM disciplina d
    JOIN area a ON a.id_area = d.id_area`;

class DisciplinaRepository {
  // ----- Áreas -----
  async listarAreas() {
    const [rows] = await pool.query("SELECT id_area AS id, nome FROM area ORDER BY nome");
    return rows;
  }

  async buscarArea(id) {
    const [rows] = await pool.query("SELECT id_area AS id, nome FROM area WHERE id_area = ?", [id]);
    return rows[0] ?? null;
  }

  async criarArea(nome) {
    const [resultado] = await pool.query("INSERT INTO area (nome) VALUES (?)", [nome]);
    return resultado.insertId;
  }

  // ----- Disciplinas -----
  async listar() {
    const [rows] = await pool.query(`${SQL_DISCIPLINA} ORDER BY d.nome`);
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(`${SQL_DISCIPLINA} WHERE d.id_disciplina = ?`, [id]);
    return rows[0] ?? null;
  }

  async criar({ nome, codigo, idArea }) {
    const [resultado] = await pool.query(
      "INSERT INTO disciplina (nome, codigo, id_area) VALUES (?, ?, ?)",
      [nome, codigo, idArea]
    );
    return resultado.insertId;
  }

  async atualizar(id, { nome, codigo, idArea }) {
    await pool.query(
      "UPDATE disciplina SET nome = ?, codigo = ?, id_area = ? WHERE id_disciplina = ?",
      [nome, codigo, idArea, id]
    );
  }

  // Quantos vínculos de professor e acompanhamentos usam a disciplina
  async contarDependencias(id) {
    const [rows] = await pool.query(
      `SELECT (SELECT COUNT(*) FROM vinculo_docente WHERE id_disciplina = ?) AS vinculos,
              (SELECT COUNT(*) FROM acompanhamento WHERE id_disciplina = ?) AS acompanhamentos`,
      [id, id]
    );
    return { vinculos: Number(rows[0].vinculos), acompanhamentos: Number(rows[0].acompanhamentos) };
  }

  async excluir(id) {
    await pool.query("DELETE FROM disciplina WHERE id_disciplina = ?", [id]);
  }
}

module.exports = new DisciplinaRepository();