// Erro "esperado" da aplicação: carrega a mensagem E o status HTTP certo.
class ErroApp extends Error {
  constructor(mensagem, status = 400) {
    super(mensagem);      // chama o construtor da classe-mãe (Error)
    this.name = "ErroApp";
    this.status = status;
  }
}

module.exports = ErroApp;