const AlunoRepository = require("../repositories/AlunoRepository");
const Aluno = require("../models/Aluno");

class AlunoService {
  async listarAlunos() {
    return await AlunoRepository.listarTodos();
  }

  async buscarAlunoPorId(id) {
    const aluno = await AlunoRepository.buscarPorId(id);
    if (!aluno) {
      throw new Error("Aluno não encontrado.");
    }
    return aluno;
  }

  async cadastrarAluno(dados) {
    const aluno = new Aluno(dados.nome, dados.dataNascimento, dados.idTurma);

    // Orquestração: primeiro valida a regra do próprio objeto,
    // só depois manda para o banco
    aluno.validar();

    const id = await AlunoRepository.criar(aluno);
    return new Aluno(aluno.nome, aluno.dataNascimento, aluno.idTurma, id);
  }

  async atualizarAluno(id, dados) {
    const aluno = new Aluno(dados.nome, dados.dataNascimento, dados.idTurma, id);
    aluno.validar();

    const atualizado = await AlunoRepository.atualizar(id, aluno);
    if (!atualizado) {
      throw new Error("Aluno não encontrado para atualização.");
    }
    return aluno;
  }

  async excluirAluno(id) {
    const excluido = await AlunoRepository.excluir(id);
    if (!excluido) {
      throw new Error("Aluno não encontrado para exclusão.");
    }
    return true;
  }
}

module.exports = new AlunoService();