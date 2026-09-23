class Aluno {
    constructor(nome, dataNascimento, idTurma, id = null) {
      this.id = id;
      this.nome = nome;
      this.dataNascimento = dataNascimento;
      this.idTurma = idTurma;
    }
  
    // Regra de negócio própria do Aluno: validar se os dados básicos estão OK
    validar() {
      if (!this.nome || this.nome.trim().length === 0) {
        throw new Error("Nome do aluno é obrigatório.");
      }
      if (!this.dataNascimento) {
        throw new Error("Data de nascimento é obrigatória.");
      }
      if (!this.idTurma) {
        throw new Error("Aluno precisa estar vinculado a uma turma.");
      }
      return true;
    }
  }
  
  module.exports = Aluno;