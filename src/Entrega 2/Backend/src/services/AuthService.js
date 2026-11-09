const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UsuarioRepository = require("../repositories/UsuarioRepository");
const Usuario = require("../models/Usuario");
const ErroApp = require("../errors/ErroApp");
const enviarEmail = require("../utils/enviarEmail");

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

const LINK_INVALIDO = "Este link é inválido ou expirou. Peça um novo link de recuperação.";

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

  async listarUsuarios(perfil) {
    if (perfil && !["ADMIN", "PROFESSOR", "RESPONSAVEL"].includes(perfil)) {
      throw new Error("Perfil inválido.");
    }
    const usuarios = await UsuarioRepository.listar(perfil || null);
    return usuarios.map((usuario) => usuario.paraResposta()); // nunca devolve o hash da senha
  }

  // Qualquer perfil troca a PRÓPRIA senha: o id vem do token, nunca do corpo da requisição
  async alterarSenha(idUsuario, senhaAtual, novaSenha) {
    if (!senhaAtual || !novaSenha) {
      throw new ErroApp("Informe a senha atual e a nova senha.");
    }

    const usuario = await UsuarioRepository.buscarPorId(idUsuario);
    if (!usuario || !usuario.ativo) {
      throw new ErroApp("Usuário não encontrado.", 404);
    }

    // 400, e não 401: um 401 faria o frontend encerrar a sessão (interceptor do api.js)
    const senhaConfere = await bcrypt.compare(senhaAtual, usuario.senhaHash);
    if (!senhaConfere) {
      throw new ErroApp("A senha atual está incorreta.");
    }
    if (novaSenha === senhaAtual) {
      throw new ErroApp("A nova senha precisa ser diferente da atual.");
    }

    // Reaproveita as regras do cadastro (8+ caracteres, letras e números, não ser senha comum)
    try {
      this.#validarSenha(novaSenha);
    } catch (error) {
      throw new ErroApp(error.message);
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await UsuarioRepository.atualizarSenha(usuario.id, senhaHash);
  }

  // ---------- Recuperação de senha ----------

  // O token do link é um JWT assinado com JWT_SECRET + o hash ATUAL da senha.
  // Quando a senha é trocada, o hash muda e o link antigo deixa de valer: uso único,
  // sem precisar de tabela nova no banco. Além disso, ele expira em 30 minutos.
  #segredoDeRecuperacao(usuario) {
    return process.env.JWT_SECRET + usuario.senhaHash;
  }

  // Endereço do frontend usado no link do e-mail (o primeiro do FRONTEND_URL)
  #enderecoDoFrontend() {
    const primeiro = (process.env.FRONTEND_URL || "").split(",")[0].trim();
    return (primeiro || "http://localhost:5173").replace(/\/$/, "");
  }

  async solicitarRecuperacao(email) {
    const emailLimpo = (email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      throw new ErroApp("Informe um e-mail válido.");
    }

    const usuario = await UsuarioRepository.buscarPorEmail(emailLimpo);

    // E-mail não cadastrado ou conta inativa: termina sem erro. A resposta é igual
    // nos dois casos, para não revelar quem tem conta no sistema.
    if (!usuario || !usuario.ativo) return;

    const token = jwt.sign(
      { id: usuario.id, tipo: "recuperacao" },
      this.#segredoDeRecuperacao(usuario),
      { expiresIn: "30m" }
    );
    const link = `${this.#enderecoDoFrontend()}/redefinir-senha?token=${encodeURIComponent(token)}`;
    const primeiroNome = usuario.nome.split(" ")[0];

    // Sem await: a resposta não espera o e-mail sair (assim ela demora o mesmo tempo
    // exista a conta ou não). Se o envio falhar, o erro aparece no terminal/log.
    enviarEmail({
      para: usuario.email,
      nomeDestinatario: usuario.nome,
      assunto: "ClassSync: redefinição de senha",
      texto: `Olá, ${primeiroNome}! Recebemos um pedido para redefinir a sua senha no ClassSync. ` +
        `Abra o link para criar uma nova senha (válido por 30 minutos): ${link} ` +
        `Se não foi você, ignore este e-mail: sua senha atual continua valendo.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; color: #0F1B33;">
          <h2 style="color: #0247CB;">Redefinição de senha</h2>
          <p>Olá, ${primeiroNome}!</p>
          <p>Recebemos um pedido para redefinir a sua senha no <strong>ClassSync</strong>.</p>
          <p style="margin: 28px 0;">
            <a href="${link}" style="background: #0247CB; color: #fff; padding: 12px 20px;
               border-radius: 8px; text-decoration: none; font-weight: bold;">Criar nova senha</a>
          </p>
          <p style="font-size: 13px; color: #5A6B8C;">O link vale por <strong>30 minutos</strong> e pode ser usado uma vez.
             Se não foi você que pediu, ignore este e-mail: sua senha atual continua valendo.</p>
        </div>`,
    }).catch((error) => console.error("[recuperar-senha] Falha ao enviar o e-mail:", error.message));
  }

  async redefinirSenha(token, novaSenha) {
    if (!token) {
      throw new ErroApp(LINK_INVALIDO);
    }

    // 1) Lê o id do token SEM confiar nele ainda, só para achar o usuário...
    const dados = jwt.decode(token);
    if (!dados || dados.tipo !== "recuperacao" || !dados.id) {
      throw new ErroApp(LINK_INVALIDO);
    }

    const usuario = await UsuarioRepository.buscarPorId(dados.id);
    if (!usuario || !usuario.ativo) {
      throw new ErroApp(LINK_INVALIDO);
    }

    // 2) ...e agora confere a assinatura e a validade com o segredo deste usuário.
    // Link adulterado, expirado ou já usado (senha trocada) cai aqui.
    try {
      jwt.verify(token, this.#segredoDeRecuperacao(usuario));
    } catch {
      throw new ErroApp(LINK_INVALIDO);
    }

    // Mesmas regras de senha do cadastro
    try {
      this.#validarSenha(novaSenha);
    } catch (error) {
      throw new ErroApp(error.message);
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await UsuarioRepository.atualizarSenha(usuario.id, senhaHash);
  }
}

module.exports = new AuthService();