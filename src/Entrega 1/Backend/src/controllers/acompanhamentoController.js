const AcompanhamentoService = require("../services/AcompanhamentoService");

async function listarAcompanhamentos(req, res) {
  try {
    const acompanhamentos = await AcompanhamentoService.listarAcompanhamentos();
    res.status(200).json(acompanhamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar acompanhamentos." });
  }
}

async function buscarAcompanhamento(req, res) {
  try {
    const acompanhamento = await AcompanhamentoService.buscarAcompanhamentoPorId(req.params.id);
    res.status(200).json(acompanhamento);
  } catch (error) {
    res.status(404).json({ erro: error.message });
  }
}

async function criarAcompanhamento(req, res) {
  try {
    const acompanhamento = await AcompanhamentoService.registrarAcompanhamento(req.body);
    res.status(201).json(acompanhamento);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
}

async function enviarParaRevisao(req, res) {
  try {
    const acompanhamento = await AcompanhamentoService.enviarParaRevisao(req.params.id);
    res.status(200).json(acompanhamento);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
}

async function publicarAcompanhamento(req, res) {
  try {
    const acompanhamento = await AcompanhamentoService.publicarAcompanhamento(req.params.id);
    res.status(200).json(acompanhamento);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
}

async function excluirAcompanhamento(req, res) {
  try {
    await AcompanhamentoService.excluirAcompanhamento(req.params.id);
    res.status(200).json({ mensagem: "Acompanhamento excluído com sucesso." });
  } catch (error) {
    res.status(404).json({ erro: error.message });
  }
}

module.exports = {
  listarAcompanhamentos,
  buscarAcompanhamento,
  criarAcompanhamento,
  enviarParaRevisao,
  publicarAcompanhamento,
  excluirAcompanhamento,
};