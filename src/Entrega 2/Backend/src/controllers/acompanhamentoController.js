const AcompanhamentoService = require("../services/AcompanhamentoService");
const ErroApp = require("../errors/ErroApp");

function responderErro(res, error) {
  if (error instanceof ErroApp) {
    return res.status(error.status).json({ erro: error.message });
  }
  console.error(error);
  return res.status(500).json({ erro: "Erro interno no servidor." });
}

async function listarAcompanhamentos(req, res) {
  try {
    const lista = await AcompanhamentoService.listarAcompanhamentos(req.usuario, req.query);
    res.status(200).json(lista);
  } catch (error) {
    responderErro(res, error);
  }
}

async function buscarAcompanhamento(req, res) {
  try {
    const acompanhamento = await AcompanhamentoService.buscarAcompanhamento(req.params.id, req.usuario);
    res.status(200).json(acompanhamento);
  } catch (error) {
    responderErro(res, error);
  }
}

async function criarAcompanhamento(req, res) {
  try {
    const acompanhamento = await AcompanhamentoService.registrarAcompanhamento(req.body, req.usuario);
    res.status(201).json(acompanhamento);
  } catch (error) {
    responderErro(res, error);
  }
}

async function atualizarAcompanhamento(req, res) {
  try {
    const acompanhamento = await AcompanhamentoService.atualizarAcompanhamento(req.params.id, req.body, req.usuario);
    res.status(200).json(acompanhamento);
  } catch (error) {
    responderErro(res, error);
  }
}

async function enviarParaRevisao(req, res) {
  try {
    const acompanhamento = await AcompanhamentoService.enviarParaRevisao(req.params.id, req.usuario);
    res.status(200).json(acompanhamento);
  } catch (error) {
    responderErro(res, error);
  }
}

async function devolverAcompanhamento(req, res) {
  try {
    const acompanhamento = await AcompanhamentoService.devolverAcompanhamento(
      req.params.id,
      req.body.motivo,
      req.usuario
    );
    res.status(200).json(acompanhamento);
  } catch (error) {
    responderErro(res, error);
  }
}

async function publicarAcompanhamento(req, res) {
  try {
    const acompanhamento = await AcompanhamentoService.publicarAcompanhamento(req.params.id, req.usuario);
    res.status(200).json(acompanhamento);
  } catch (error) {
    responderErro(res, error);
  }
}

async function excluirAcompanhamento(req, res) {
  try {
    await AcompanhamentoService.excluirAcompanhamento(req.params.id);
    res.status(200).json({ mensagem: "Acompanhamento excluído com sucesso." });
  } catch (error) {
    responderErro(res, error);
  }
}

module.exports = {
  listarAcompanhamentos,
  buscarAcompanhamento,
  criarAcompanhamento,
  atualizarAcompanhamento,
  enviarParaRevisao,
  devolverAcompanhamento,
  publicarAcompanhamento,
  excluirAcompanhamento,
};