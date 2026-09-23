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

  async criar(aluno) {
    const [resultado] = await pool.query(
      "INSERT INTO aluno (nome, data_nascimento, id_turma) VALUES (?, ?, ?)",
      [aluno.nome, aluno.dataNascimento, aluno.idTurma]
    );
    return resultado.insertId;
  }
}

module.exports = new AlunoRepository();