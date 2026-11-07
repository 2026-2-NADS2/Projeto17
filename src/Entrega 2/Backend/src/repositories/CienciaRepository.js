const pool = require("../config/database");

// Cada ciência já vem com o contexto: de qual aluno, turma, disciplina e bimestre
const SQL_CIENCIA = `
  SELECT c.id_acompanhamento, c.observacao,
         DATE_FORMAT(c.data_hora, '%Y-%m-%dT%H:%i') AS data_hora,
         u.id_usuario AS id_responsavel, u.nome AS nome_responsavel,
         al.id_aluno, al.nome AS nome_aluno,
         t.id_turma, t.nome AS nome_turma,
         d.id_disciplina, d.nome AS nome_disciplina,
         b.id_bimestre, b.numero AS numero_bimestre
    FROM ciencia_responsavel c
    JOIN usuario u        ON u.id_usuario = c.id_responsavel
    JOIN acompanhamento a ON a.id_acompanhamento = c.id_acompanhamento
    JOIN aluno al         ON al.id_aluno = a.id_aluno
    JOIN turma t          ON t.id_turma = al.id_turma
    JOIN disciplina d     ON d.id_disciplina = a.id_disciplina
    JOIN bimestre b       ON b.id_bimestre = a.id_bimestre`;

class CienciaRepository {
  // filtros: { idProfessor, idResponsavel, idBimestre, idAcompanhamento } — todos opcionais
  async listar(filtros = {}) {
    const mapa = {
      idProfessor: "a.id_professor = ?",
      idResponsavel: "c.id_responsavel = ?",
      idBimestre: "a.id_bimestre = ?",
      idAcompanhamento: "c.id_acompanhamento = ?",
    };
    const condicoes = [];
    const valores = [];
    for (const [filtro, condicao] of Object.entries(mapa)) {
      if (filtros[filtro]) {
        condicoes.push(condicao);
        valores.push(filtros[filtro]);
      }
    }

    const where = condicoes.length > 0 ? `WHERE ${condicoes.join(" AND ")}` : "";
    const [rows] = await pool.query(`${SQL_CIENCIA} ${where} ORDER BY c.data_hora DESC`, valores);
    return rows.map((row) => this.#mapearParaResposta(row));
  }

  async registrar(idAcompanhamento, idResponsavel, observacao) {
    await pool.query(
      "INSERT INTO ciencia_responsavel (id_acompanhamento, id_responsavel, observacao) VALUES (?, ?, ?)",
      [idAcompanhamento, idResponsavel, observacao]
    );
  }

  #mapearParaResposta(row) {
    return {
      idAcompanhamento: row.id_acompanhamento,
      responsavel: { id: row.id_responsavel, nome: row.nome_responsavel },
      aluno: { id: row.id_aluno, nome: row.nome_aluno },
      turma: { id: row.id_turma, nome: row.nome_turma },
      disciplina: { id: row.id_disciplina, nome: row.nome_disciplina },
      bimestre: { id: row.id_bimestre, numero: row.numero_bimestre },
      observacao: row.observacao,
      dataHora: row.data_hora,
    };
  }
}

module.exports = new CienciaRepository();