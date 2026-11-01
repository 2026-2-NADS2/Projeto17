const pool = require("../config/database");
const Aluno = require("../models/Aluno");

class AlunoRepository {
  async listarTodos() {
    const [rows] = await pool.query("SELECT * FROM aluno");
    return rows.map(
      (row) => new Aluno(row.nome, row.data_nascimento, row.id_turma, row.id_aluno)
    );
  }

  async buscarPorId(id) {
    const [rows] = await pool.query("SELECT * FROM aluno WHERE id_aluno = ?", [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return new Aluno(row.nome, row.data_nascimento, row.id_turma, row.id_aluno);
  }

  async listarPorResponsavel(idResponsavel) {
    const [rows] = await pool.query(
      `SELECT al.*
         FROM aluno al
         JOIN responsavel_aluno ra ON ra.id_aluno = al.id_aluno
        WHERE ra.id_responsavel = ?
        ORDER BY al.nome`,
      [idResponsavel]
    );
    return rows.map(
      (row) => new Aluno(row.nome, row.data_nascimento, row.id_turma, row.id_aluno)
    );
  }

  async responsavelTemAluno(idResponsavel, idAluno) {
    const [rows] = await pool.query(
      "SELECT 1 FROM responsavel_aluno WHERE id_responsavel = ? AND id_aluno = ?",
      [idResponsavel, idAluno]
    );
    return rows.length > 0;
  }

  async criar(aluno) {
    const [resultado] = await pool.query(
      "INSERT INTO aluno (nome, data_nascimento, id_turma) VALUES (?, ?, ?)",
      [aluno.nome, aluno.dataNascimento, aluno.idTurma]
    );
    return resultado.insertId;
  }

  async atualizar(id, aluno) {
    const [resultado] = await pool.query(
      "UPDATE aluno SET nome = ?, data_nascimento = ?, id_turma = ? WHERE id_aluno = ?",
      [aluno.nome, aluno.dataNascimento, aluno.idTurma, id]
    );
    return resultado.affectedRows > 0;
  }

  async excluir(id) {
    const [resultado] = await pool.query("DELETE FROM aluno WHERE id_aluno = ?", [id]);
    return resultado.affectedRows > 0;
  }
}

module.exports = new AlunoRepository();