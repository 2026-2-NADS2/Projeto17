const pool = require("../config/database");
const Acompanhamento = require("../models/Acompanhamento");

// SELECT com JOIN: traz os NOMES (aluno, disciplina, professor...) junto com os IDs
const SQL_DETALHADO = `
  SELECT a.id_acompanhamento, a.status, a.media, a.descricao, a.motivo_devolucao, a.publicado_em,
         a.id_aluno,      al.nome AS nome_aluno,
         t.id_turma,      t.nome  AS nome_turma,
         a.id_disciplina, d.nome  AS nome_disciplina,
         a.id_professor,  u.nome  AS nome_professor,
         a.id_bimestre,   b.numero AS numero_bimestre,
         an.ano AS ano_letivo
  FROM acompanhamento a
  JOIN aluno al      ON al.id_aluno = a.id_aluno
  JOIN turma t       ON t.id_turma = al.id_turma
  JOIN disciplina d  ON d.id_disciplina = a.id_disciplina
  JOIN usuario u     ON u.id_usuario = a.id_professor
  JOIN bimestre b    ON b.id_bimestre = a.id_bimestre
  JOIN ano_letivo an ON an.id_ano_letivo = b.id_ano_letivo
`;

class AcompanhamentoRepository {
  // Lista com filtros opcionais: { id, status, idProfessor, idAluno, idResponsavel }
  async listar(filtros = {}) {
    const condicoes = [];
    const valores = [];

    if (filtros.id) {
      condicoes.push("a.id_acompanhamento = ?");
      valores.push(filtros.id);
    }
    if (filtros.status) {
      condicoes.push("a.status = ?");
      valores.push(filtros.status);
    }
    if (filtros.idProfessor) {
      condicoes.push("a.id_professor = ?");
      valores.push(filtros.idProfessor);
    }
    if (filtros.idAluno) {
      condicoes.push("a.id_aluno = ?");
      valores.push(filtros.idAluno);
    }
    if (filtros.idResponsavel) {
      condicoes.push("a.id_aluno IN (SELECT ra.id_aluno FROM responsavel_aluno ra WHERE ra.id_responsavel = ?)");
      valores.push(filtros.idResponsavel);
    }

    const where = condicoes.length > 0 ? `WHERE ${condicoes.join(" AND ")}` : "";
    const [rows] = await pool.query(`${SQL_DETALHADO} ${where} ORDER BY a.id_acompanhamento DESC`, valores);

    const lista = rows.map((row) => this.#mapearParaResposta(row));
    await this.#anexarTags(lista);
    return lista;
  }

  // Busca "crua", em forma de Model, para aplicar as regras de negócio
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

  async atualizarDados(id, media, descricao) {
    await pool.query(
      "UPDATE acompanhamento SET media = ?, descricao = ? WHERE id_acompanhamento = ?",
      [media, descricao, id]
    );
  }

  async atualizarStatus(id, novoStatus, motivoDevolucao = null) {
    const [resultado] = await pool.query(
      `UPDATE acompanhamento
         SET status = ?,
             motivo_devolucao = ?,
             publicado_em = CASE WHEN ? = 'PUBLICADO' THEN NOW() ELSE publicado_em END
       WHERE id_acompanhamento = ?`,
      [novoStatus, motivoDevolucao, novoStatus, id]
    );
    return resultado.affectedRows > 0;
  }

  // Substitui as tags: apaga as antigas e grava as novas
  async definirTags(idAcompanhamento, idsTags) {
    await pool.query("DELETE FROM acompanhamento_tag WHERE id_acompanhamento = ?", [idAcompanhamento]);
    if (idsTags.length === 0) return;

    const linhas = idsTags.map((idTag) => [idAcompanhamento, idTag]);
    await pool.query("INSERT INTO acompanhamento_tag (id_acompanhamento, id_tag) VALUES ?", [linhas]);
  }

  async tagsExistem(idsTags) {
    if (idsTags.length === 0) return true;
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM tag WHERE id_tag IN (?)", [idsTags]);
    return rows[0].total === idsTags.length;
  }

  async excluir(id) {
    await this.definirTags(id, []); // remove as tags antes (chave estrangeira)
    const [resultado] = await pool.query(
      "DELETE FROM acompanhamento WHERE id_acompanhamento = ?",
      [id]
    );
    return resultado.affectedRows > 0;
  }

  async #anexarTags(lista) {
    if (lista.length === 0) return;
    const ids = lista.map((a) => a.id);
    const [rows] = await pool.query(
      `SELECT atg.id_acompanhamento, tg.id_tag, tg.nome
         FROM acompanhamento_tag atg
         JOIN tag tg ON tg.id_tag = atg.id_tag
        WHERE atg.id_acompanhamento IN (?)`,
      [ids]
    );
    for (const acompanhamento of lista) {
      acompanhamento.tags = rows
        .filter((r) => r.id_acompanhamento === acompanhamento.id)
        .map((r) => ({ id: r.id_tag, nome: r.nome }));
    }
  }

  #converterMedia(valor) {
    return valor === null ? null : Number(valor);
  }

  #mapearParaObjeto(row) {
    return new Acompanhamento(
      row.id_aluno,
      row.id_disciplina,
      row.id_professor,
      row.id_bimestre,
      this.#converterMedia(row.media),
      row.descricao,
      row.status,
      row.id_acompanhamento,
      row.motivo_devolucao
    );
  }

  #mapearParaResposta(row) {
    return {
      id: row.id_acompanhamento,
      status: row.status,
      media: this.#converterMedia(row.media),
      descricao: row.descricao,
      motivoDevolucao: row.motivo_devolucao,
      publicadoEm: row.publicado_em,
      aluno: { id: row.id_aluno, nome: row.nome_aluno },
      turma: { id: row.id_turma, nome: row.nome_turma },
      disciplina: { id: row.id_disciplina, nome: row.nome_disciplina },
      professor: { id: row.id_professor, nome: row.nome_professor },
      bimestre: { id: row.id_bimestre, numero: row.numero_bimestre },
      anoLetivo: row.ano_letivo,
      tags: [],
    };
  }
}

module.exports = new AcompanhamentoRepository();