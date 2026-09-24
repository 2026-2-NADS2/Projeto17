const pool = require("../config/database");
const Acompanhamento = require("../models/Acompanhamento");

class AcompanhamentoRepository {
  async listarTodos() {
    const [rows] = await pool.query("SELECT * FROM acompanhamento");
    return rows.map((row) => this.#mapearParaObjeto(row));
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(
      "SELECT * FROM acompanhamento WHERE id_acompanhamento = ?",
      [id]
    );
    if (rows.length === 0) return null;
    return this.#mapearParaObjeto(rows[0]);
  }

  async criar(acompanhamento) {
    const [resultado] = await pool.query(
      `INSERT INTO acompanhamento 
        (id_aluno, id_disciplina, id_professor, id_bimestre, media, descricao, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        acompanhamento.idAluno,
        acompanhamento.idDisciplina,
        acompanhamento.idProfessor,
        acompanhamento.idBimestre,
        acompanhamento.media,
        acompanhamento.descricao,
        acompanhamento.status,
      ]
    );
    return resultado.insertId;
  }

  async atualizarStatus(id, novoStatus) {
    const [resultado] = await pool.query(
      "UPDATE acompanhamento SET status = ? WHERE id_acompanhamento = ?",
      [novoStatus, id]
    );
    return resultado.affectedRows > 0;
  }

  async excluir(id) {
    const [resultado] = await pool.query(
      "DELETE FROM acompanhamento WHERE id_acompanhamento = ?",
      [id]
    );
    return resultado.affectedRows > 0;
  }

  // Método privado auxiliar, só usado dentro desta classe
  #mapearParaObjeto(row) {
    return new Acompanhamento(
      row.id_aluno,
      row.id_disciplina,
      row.id_professor,
      row.id_bimestre,
      row.media,
      row.descricao,
      row.status,
      row.id_acompanhamento
    );
  }
}

module.exports = new AcompanhamentoRepository();