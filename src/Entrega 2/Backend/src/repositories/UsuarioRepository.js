const pool = require("../config/database");
const Usuario = require("../models/Usuario");

class UsuarioRepository {
  async buscarPorEmail(email) {
    const [rows] = await pool.query("SELECT * FROM usuario WHERE email = ?", [email]);
    if (rows.length === 0) return null;
    return this.#mapearParaObjeto(rows[0]);
  }

  async buscarPorId(id) {
    const [rows] = await pool.query("SELECT * FROM usuario WHERE id_usuario = ?", [id]);
    if (rows.length === 0) return null;
    return this.#mapearParaObjeto(rows[0]);
  }

  async criar(usuario) {
    const [resultado] = await pool.query(
      "INSERT INTO usuario (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, ?, ?)",
      [usuario.nome, usuario.email, usuario.senhaHash, usuario.perfil, usuario.ativo]
    );
    return resultado.insertId;
  }

  #mapearParaObjeto(row) {
    return new Usuario(
      row.nome,
      row.email,
      row.senha_hash,
      row.perfil,
      !!row.ativo,
      row.id_usuario
    );
  }
}

module.exports = new UsuarioRepository();