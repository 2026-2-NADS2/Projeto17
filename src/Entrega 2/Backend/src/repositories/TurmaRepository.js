const pool = require("../config/database");

// SELECT comum: devolve a turma já no formato da API ({ id, nome, serie, turno, anoLetivo })
const SQL_TURMA = `
  SELECT t.id_turma AS id, t.nome, t.serie, t.turno, an.ano AS anoLetivo
    FROM turma t
    JOIN ano_letivo an ON an.id_ano_letivo = t.id_ano_letivo`;

class TurmaRepository {
  async listar() {
    const [rows] = await pool.query(`${SQL_TURMA} ORDER BY an.ano DESC, t.nome`);
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(`${SQL_TURMA} WHERE t.id_turma = ?`, [id]);
    return rows[0] ?? null;
  }

  // A tela manda o ANO (2026); o banco guarda o id do ano letivo.
  // Se o ano ainda não existir (ex.: turmas de 2027), ele é criado.
  async obterIdAnoLetivo(ano) {
    const [rows] = await pool.query("SELECT id_ano_letivo AS id FROM ano_letivo WHERE ano = ?", [ano]);
    if (rows.length > 0) return rows[0].id;

    const [resultado] = await pool.query("INSERT INTO ano_letivo (ano) VALUES (?)", [ano]);
    return resultado.insertId;
  }

  async criar({ idAnoLetivo, nome, serie, turno }) {
    const [resultado] = await pool.query(
      "INSERT INTO turma (id_ano_letivo, nome, serie, turno) VALUES (?, ?, ?, ?)",
      [idAnoLetivo, nome, serie, turno]
    );
    return resultado.insertId;
  }

  async atualizar(id, { idAnoLetivo, nome, serie, turno }) {
    await pool.query(
      "UPDATE turma SET id_ano_letivo = ?, nome = ?, serie = ?, turno = ? WHERE id_turma = ?",
      [idAnoLetivo, nome, serie, turno, id]
    );
  }

  // Quantos alunos e vínculos de professor dependem da turma
  async contarDependencias(id) {
    const [rows] = await pool.query(
      `SELECT (SELECT COUNT(*) FROM aluno WHERE id_turma = ?) AS alunos,
              (SELECT COUNT(*) FROM vinculo_docente WHERE id_turma = ?) AS vinculos`,
      [id, id]
    );
    return { alunos: Number(rows[0].alunos), vinculos: Number(rows[0].vinculos) };
  }

  async excluir(id) {
    await pool.query("DELETE FROM turma WHERE id_turma = ?", [id]);
  }
}

module.exports = new TurmaRepository();