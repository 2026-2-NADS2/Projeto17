const pool = require("../config/database");

// SELECT comum: vínculo com os ids E os nomes (a tela não precisa cruzar listas)
const SQL_VINCULO = `
  SELECT v.id_vinculo AS id,
         v.id_turma AS idTurma, t.nome AS turma, t.serie, t.turno,
         v.id_disciplina AS idDisciplina, d.nome AS disciplina,
         v.id_professor AS idProfessor, u.nome AS professor,
         an.ano AS anoLetivo
    FROM vinculo_docente v
    JOIN turma t       ON t.id_turma = v.id_turma
    JOIN ano_letivo an ON an.id_ano_letivo = t.id_ano_letivo
    JOIN disciplina d  ON d.id_disciplina = v.id_disciplina
    JOIN usuario u     ON u.id_usuario = v.id_professor`;

class VinculoRepository {
  // filtros: { idProfessor, idTurma } — os dois opcionais
  async listar(filtros = {}) {
    const condicoes = [];
    const valores = [];

    if (filtros.idProfessor) {
      condicoes.push("v.id_professor = ?");
      valores.push(filtros.idProfessor);
    }
    if (filtros.idTurma) {
      condicoes.push("v.id_turma = ?");
      valores.push(filtros.idTurma);
    }

    const where = condicoes.length > 0 ? `WHERE ${condicoes.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `${SQL_VINCULO} ${where} ORDER BY an.ano DESC, t.nome, d.nome`,
      valores
    );
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(`${SQL_VINCULO} WHERE v.id_vinculo = ?`, [id]);
    return rows[0] ?? null;
  }

  async criar({ idTurma, idDisciplina, idProfessor }) {
    const [resultado] = await pool.query(
      "INSERT INTO vinculo_docente (id_turma, id_disciplina, id_professor) VALUES (?, ?, ?)",
      [idTurma, idDisciplina, idProfessor]
    );
    return resultado.insertId;
  }

  async excluir(id) {
    await pool.query("DELETE FROM vinculo_docente WHERE id_vinculo = ?", [id]);
  }

  // Confere de uma vez se turma, disciplina e professor (ativo) existem
  async conferirReferencias({ idTurma, idDisciplina, idProfessor }) {
    const [rows] = await pool.query(
      `SELECT (SELECT COUNT(*) FROM turma WHERE id_turma = ?) AS turma,
              (SELECT COUNT(*) FROM disciplina WHERE id_disciplina = ?) AS disciplina,
              (SELECT COUNT(*) FROM usuario
                WHERE id_usuario = ? AND perfil = 'PROFESSOR' AND ativo = TRUE) AS professor`,
      [idTurma, idDisciplina, idProfessor]
    );
    return {
      turma: Number(rows[0].turma) > 0,
      disciplina: Number(rows[0].disciplina) > 0,
      professor: Number(rows[0].professor) > 0,
    };
  }

  // O professor dá esta disciplina na turma deste aluno?
  async professorLeciona(idProfessor, idAluno, idDisciplina) {
    const [rows] = await pool.query(
      `SELECT 1
         FROM vinculo_docente v
         JOIN aluno a ON a.id_turma = v.id_turma
        WHERE v.id_professor = ? AND a.id_aluno = ? AND v.id_disciplina = ?
        LIMIT 1`,
      [idProfessor, idAluno, idDisciplina]
    );
    return rows.length > 0;
  }
}

module.exports = new VinculoRepository();