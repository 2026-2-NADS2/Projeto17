const pool = require("../config/database");

// usos: em quantos acompanhamentos a tag aparece (decide se ela pode ser excluída)
const SQL_TAG = `
  SELECT t.id_tag AS id, t.nome, t.descricao,
         (SELECT COUNT(*) FROM acompanhamento_tag at WHERE at.id_tag = t.id_tag) AS usos
    FROM tag t`;

// COUNT chega do MySQL como número "grande"; a API devolve number comum
const paraResposta = (tag) => ({ ...tag, usos: Number(tag.usos) });

class TagRepository {
  async listar() {
    const [rows] = await pool.query(`${SQL_TAG} ORDER BY t.nome`);
    return rows.map(paraResposta);
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(`${SQL_TAG} WHERE t.id_tag = ?`, [id]);
    return rows.length > 0 ? paraResposta(rows[0]) : null;
  }

  async criar({ nome, descricao }) {
    const [resultado] = await pool.query("INSERT INTO tag (nome, descricao) VALUES (?, ?)", [nome, descricao]);
    return resultado.insertId;
  }

  async atualizar(id, { nome, descricao }) {
    await pool.query("UPDATE tag SET nome = ?, descricao = ? WHERE id_tag = ?", [nome, descricao, id]);
  }

  async excluir(id) {
    await pool.query("DELETE FROM tag WHERE id_tag = ?", [id]);
  }
}

module.exports = new TagRepository();