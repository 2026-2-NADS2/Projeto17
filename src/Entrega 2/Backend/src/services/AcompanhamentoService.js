const AcompanhamentoRepository = require("../repositories/AcompanhamentoRepository");
const Acompanhamento = require("../models/Acompanhamento");

class AcompanhamentoService {
  async listarAcompanhamentos() {
    return await AcompanhamentoRepository.listarTodos();
  }

  async buscarAcompanhamentoPorId(id) {
    const acompanhamento = await AcompanhamentoRepository.buscarPorId(id);
    if (!acompanhamento) {
      throw new Error("Acompanhamento não encontrado.");
    }
    return acompanhamento;
  }

  async registrarAcompanhamento(dados) {
    const acompanhamento = new Acompanhamento(
      dados.idAluno,
      dados.idDisciplina,
      dados.idProfessor,
      dados.idBimestre,
      dados.media,
      dados.descricao
    );

    // Orquestração: valida as regras do próprio objeto antes de salvar
    acompanhamento.validar();

    const id = await AcompanhamentoRepository.criar(acompanhamento);
    return await this.buscarAcompanhamentoPorId(id);
  }

  async enviarParaRevisao(id) {
    const acompanhamento = await this.buscarAcompanhamentoPorId(id);

    // A regra de "só pode enviar se estiver em rascunho" mora no próprio Model
    acompanhamento.enviarParaRevisao();

    await AcompanhamentoRepository.atualizarStatus(id, acompanhamento.status);
    return acompanhamento;
  }

  async publicarAcompanhamento(id) {
    const acompanhamento = await this.buscarAcompanhamentoPorId(id);

    // A regra de "só pode publicar se estiver enviado/em revisão" mora no Model
    acompanhamento.publicar();

    await AcompanhamentoRepository.atualizarStatus(id, acompanhamento.status);
    return acompanhamento;
  }

  async excluirAcompanhamento(id) {
    const excluido = await AcompanhamentoRepository.excluir(id);
    if (!excluido) {
      throw new Error("Acompanhamento não encontrado para exclusão.");
    }
    return true;
  }
}

module.exports = new AcompanhamentoService();