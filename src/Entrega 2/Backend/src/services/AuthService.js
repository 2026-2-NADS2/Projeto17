const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UsuarioRepository = require("../repositories/UsuarioRepository");
const Usuario = require("../models/Usuario");

const SENHAS_COMUNS = [
  // Sequências numéricas e teclado (com letras para passar na regra)
  "12345678", "123456789", "1234567890", "qwerty123", "qwertyui",
  "qwerty12", "abc12345", "abcd1234", "a1b2c3d4", "1q2w3e4r",
  "q1w2e3r4", "asdf1234", "zxcvbnm1",

  // Variações de "senha" e "password"
  "senha123", "senha1234", "senha@123", "senha2026", "senha2025",
  "minhasenha1", "password1", "password12", "password123", "passw0rd",

  // Termos administrativos e de teste
  "admin123", "admin1234", "admin@123", "mudar123", "mudar@123",
  "teste123", "teste1234", "usuario1", "usuario123", "professor1",
  "escola123", "classsync1", "classsync123",

  // Muito comuns no Brasil
  "brasil123", "brasil2026", "brasil2025", "flamengo1", "corinthians1",
  "palmeiras1", "iloveyou1", "amor1234", "teamo123"
];

class AuthService {

  #validarSenha(senha) {
    if (!senha || senha.length < 8) {
      throw new Error("A senha deve ter pelo menos 8 caracteres.");
    }
    if (senha.length > 72) {
      throw new Error("A senha é longa demais.");
    }
    if (!/[A-Za-z]/.test(senha) || !/[0-9]/.test(senha)) {
      throw new Error("A senha deve conter letras e números.");
    }
    if (SENHAS_COMUNS.includes(senha.toLowerCase())) {
      throw new Error("Essa senha é muito comum. Escolha outra.");
    }
  }

  async login(email, senha) {
    if (!email || !senha) {
      throw new Error("E-mail e senha são obrigatórios.");
    }

    const usuario = await UsuarioRepository.buscarPorEmail(email);
    if (!usuario || !usuario.ativo) {
      throw new Error("Credenciais inválidas.");
    }

    const senhaConfere = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaConfere) {
      throw new Error("Credenciais inválidas.");
    }

    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return { token, usuario: usuario.paraResposta() };
  }

  async cadastrarUsuario(dados) {
    this.#validarSenha(dados.senha);

    const existente = await UsuarioRepository.buscarPorEmail(dados.email);
    if (existente) {
      throw new Error("Já existe um usuário com esse e-mail.");
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);
    const usuario = new Usuario(dados.nome, dados.email, senhaHash, dados.perfil);
    usuario.validar();

    const id = await UsuarioRepository.criar(usuario);
    return new Usuario(usuario.nome, usuario.email, senhaHash, usuario.perfil, true, id).paraResposta();
  }
}

module.exports = new AuthService();