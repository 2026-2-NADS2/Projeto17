const AuthService = require("../services/AuthService");

async function login(req, res) {
  try {
    const resultado = await AuthService.login(req.body.email, req.body.senha);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(401).json({ erro: error.message });
  }
}

async function cadastrarUsuario(req, res) {
  try {
    const usuario = await AuthService.cadastrarUsuario(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
}

async function listarUsuarios(req, res) {
  try {
    const usuarios = await AuthService.listarUsuarios(req.query.perfil);
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
}

module.exports = { login, cadastrarUsuario, listarUsuarios };