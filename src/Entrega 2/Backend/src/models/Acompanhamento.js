const ErroApp = require("../errors/ErroApp");

class Acompanhamento {
  constructor(idAluno, idDisciplina, idProfessor, idBimestre, media, descricao,
              status = "RASCUNHO", id = null, motivoDevolucao = null) {
    this.id = id;
    this.idAluno = idAluno;
    this.idDisciplina = idDisciplina;
    this.idProfessor = idProfessor;
    this.idBimestre = idBimestre;
    this.media = media;
    this.descricao = descricao;
    this.status = status;
    this.motivoDevolucao = motivoDevolucao;
  }

  validar() {
    if (!this.idAluno) throw new ErroApp("Acompanhamento precisa estar vinculado a um aluno.");
    if (!this.idDisciplina) throw new ErroApp("Acompanhamento precisa estar vinculado a uma disciplina.");
    if (!this.idProfessor) throw new ErroApp("Acompanhamento precisa estar vinculado a um professor.");
    if (!this.idBimestre) throw new ErroApp("Acompanhamento precisa estar vinculado a um bimestre.");

    if (this.media !== null && this.media !== undefined) {
      if (typeof this.media !== "number" || this.media < 0 || this.media > 10) {
        throw new ErroApp("A média deve ser um número entre 0 e 10.");
      }
    }
  }

  // Só rascunho ou devolvido podem ser mexidos pelo professor
  podeSerEditado() {
    return this.status === "RASCUNHO" || this.status === "DEVOLVIDO";
  }

  atualizarDados(media, descricao) {
    if (!this.podeSerEditado()) {
      throw new ErroApp("Só é possível editar um acompanhamento em rascunho ou devolvido.");
    }
    this.media = media;
    this.descricao = descricao;
    this.validar();
  }

  enviarParaRevisao() {
    if (!this.podeSerEditado()) {
      throw new ErroApp("Só é possível enviar um acompanhamento em rascunho ou devolvido.");
    }
    if (!this.descricao || this.descricao.trim() === "") {
      throw new ErroApp("Preencha a descrição antes de enviar para revisão.");
    }
    this.status = "ENVIADO";
    this.motivoDevolucao = null; // foi corrigido, o motivo antigo deixa de valer
  }

  devolver(motivo) {
    if (this.status !== "ENVIADO" && this.status !== "EM_REVISAO") {
      throw new ErroApp("Só é possível devolver um acompanhamento enviado ou em revisão.");
    }
    if (!motivo || motivo.trim().length < 10) {
      throw new ErroApp("Informe o motivo da devolução (mínimo de 10 caracteres).");
    }
    this.status = "DEVOLVIDO";
    this.motivoDevolucao = motivo.trim();
  }

  publicar() {
    if (this.status !== "ENVIADO" && this.status !== "EM_REVISAO") {
      throw new ErroApp("Só é possível publicar um acompanhamento enviado ou em revisão.");
    }
    this.status = "PUBLICADO";
  }
}

module.exports = Acompanhamento;