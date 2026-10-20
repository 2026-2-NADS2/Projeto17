class Usuario {
    constructor(nome, email, senhaHash, perfil, ativo = true, id = null) {
      this.id = id;
      this.nome = nome;
      this.email = email;
      this.senhaHash = senhaHash;
      this.perfil = perfil;
      this.ativo = ativo;
    }
  
    validar() {
      if (!this.nome || this.nome.trim().length === 0) {
        throw new Error("Nome é obrigatório.");
      }
      if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
        throw new Error("E-mail inválido.");
      }
      if (!["ADMIN", "PROFESSOR", "RESPONSAVEL"].includes(this.perfil)) {
        throw new Error("Perfil inválido.");
      }
      return true;
    }
  
    paraResposta() {
      return {
        id: this.id,
        nome: this.nome,
        email: this.email,
        perfil: this.perfil,
        ativo: this.ativo,
      };
    }
  }
  
  module.exports = Usuario;