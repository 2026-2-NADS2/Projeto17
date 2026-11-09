const pool = require("../config/database");

// Cada linha do histórico (gravada pelos triggers) com o contexto do acompanhamento
const SQL_HISTORICO = `
  SELECT h.id_historico, h.id_acompanhamento, h.status_anterior, h.status_novo,
         DATE_FORMAT(h.data_hora, '%Y-%m-%dT%H:%i') AS data_hora,
         u.id_usuario, u.nome AS nome_usuario,
         al.nome AS nome_aluno, d.nome AS nome_disciplina, b.numero AS numero_bimestre
    FROM acompanhamento_historico h
    JOIN acompanhamento a ON a.id_acompanhamento = h.id_acompanhamento
    JOIN aluno al         ON al.id_aluno = a.id_aluno
    JOIN disciplina d     ON d.id_disciplina = a.id_disciplina
    JOIN bimestre b       ON b.id_bimestre = a.id_bimestre
    LEFT JOIN usuario u   ON u.id_usuario = h.id_usuario`;

class AuditoriaRepository {
  // Os mais recentes primeiro; o limite evita devolver milhares de linhas de uma vez
  async listarHistorico(limite = 500) {
    const [rows] = await pool.query(
      `${SQL_HISTORICO} ORDER BY h.data_hora DESC, h.id_historico DESC LIMIT ?`,
      [limite]
    );
    return rows;
  }
}

module.exports = new AuditoriaRepository();