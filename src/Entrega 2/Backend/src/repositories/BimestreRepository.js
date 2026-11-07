const pool = require("../config/database");

// Datas saem como texto "2026-10-13T00:00" (formato do <input type="datetime-local">).
// Assim o fuso horário do Node não muda a hora no caminho até a tela.
// "aberto" usa NOW(): compara data E hora com o momento atual.
const SQL_BIMESTRE = `
  SELECT b.id_bimestre AS id, b.numero, an.ano AS anoLetivo,
         DATE_FORMAT(b.dt_abertura, '%Y-%m-%dT%H:%i') AS dataAbertura,
         DATE_FORMAT(b.dt_encerramento, '%Y-%m-%dT%H:%i') AS dataEncerramento,
         (NOW() BETWEEN b.dt_abertura AND b.dt_encerramento) AS aberto,
         b.id_ano_letivo AS idAnoLetivo
    FROM bimestre b
    JOIN ano_letivo an ON an.id_ano_letivo = b.id_ano_letivo`;

// O MySQL devolve 1/0; a API devolve true/false. idAnoLetivo é só para uso interno.
function paraResposta({ idAnoLetivo, ...bimestre }) {
  return { ...bimestre, aberto: !!bimestre.aberto };
}

class BimestreRepository {
  async listar(anoLetivo) {
    const where = anoLetivo ? "WHERE an.ano = ?" : "";
    const [rows] = await pool.query(
      `${SQL_BIMESTRE} ${where} ORDER BY an.ano DESC, b.numero`,
      anoLetivo ? [anoLetivo] : []
    );
    return rows.map(paraResposta);
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(`${SQL_BIMESTRE} WHERE b.id_bimestre = ?`, [id]);
    return rows.length > 0 ? paraResposta(rows[0]) : null;
  }

  // Os outros bimestres do mesmo ano letivo (para conferir a ordem das datas)
  async listarVizinhos(id) {
    const [rows] = await pool.query(
      `${SQL_BIMESTRE}
        WHERE b.id_ano_letivo = (SELECT id_ano_letivo FROM bimestre WHERE id_bimestre = ?)
          AND b.id_bimestre <> ?
        ORDER BY b.numero`,
      [id, id]
    );
    return rows.map(paraResposta);
  }

  async atualizarPeriodo(id, abertura, encerramento) {
    await pool.query(
      "UPDATE bimestre SET dt_abertura = ?, dt_encerramento = ? WHERE id_bimestre = ?",
      [abertura, encerramento, id]
    );
  }
}

module.exports = new BimestreRepository();