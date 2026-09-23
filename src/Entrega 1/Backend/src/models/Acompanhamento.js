class Acompanhamento {
  constructor(idAluno, idDisciplina, idProfessor, idBimestre, media, descricao, status = "RASCUNHO", id = null) {
    this.id = id;
    this.idAluno = idAluno;
    this.idDisciplina = idDisciplina;
    this.idProfessor = idProfessor;
    this.idBimestre = idBimestre;
    this.media = media;
    this.descricao = descricao;
    this.status = status;
  }

  // Regra de negócio própria: validar dados básicos
  validar() {
    if (!this.idAluno) {
      throw new Error("Acompanhamento precisa estar vinculado a um aluno.");
    }
    if (!this.idDisciplina) {
      throw new Error("Acompanhamento precisa estar vinculado a uma disciplina.");
    }
    if (!this.idProfessor) {
      throw new Error("Acompanhamento precisa estar vinculado a um professor.");
    }
    if (!this.idBimestre) {
      throw new Error("Acompanhamento precisa estar vinculado a um bimestre.");
    }
    if (this.media !== null && this.media !== undefined) {
      if (this.media < 0 || this.media > 10) {
        throw new Error("A média deve estar entre 0 e 10.");
      }
    }
  }

  // Regra de negócio: só pode enviar se estiver em rascunho
  enviarParaRevisao() {
    if (this.status !== "RASCUNHO") {
      throw new Error("Só é possível enviar para revisão um acompanhamento em rascunho.");
    }
    this.status = "ENVIADO";
  }

  // Regra de negócio: só pode publicar se estiver em revisão
  publicar() {
    if (this.status !== "EM_REVISAO" && this.status !== "ENVIADO") {
      throw new Error("Só é possível publicar um acompanhamento enviado ou em revisão.");
    }
    this.status = "PUBLICADO";
  }
}

module.exports = Acompanhamento;