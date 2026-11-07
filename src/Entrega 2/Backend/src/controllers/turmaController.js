const TurmaService = require("../services/TurmaService");
const responderErro = require("../utils/responderErro");

async function listarTurmas(req, res) {
  try {
    res.status(200).json(await TurmaService.listarTurmas());
  } catch (error) {
    responderErro(res, error);
  }
}

async function criarTurma(req, res) {
  try {
    res.status(201).json(await TurmaService.criarTurma(req.body));
  } catch (error) {
    responderErro(res, error);
  }
}

async function atualizarTurma(req, res) {
  try {
    res.status(200).json(await TurmaService.atualizarTurma(req.params.id, req.body));
  } catch (error) {
    responderErro(res, error);
  }
}

async function excluirTurma(req, res) {
  try {
    await TurmaService.excluirTurma(req.params.id);
    res.status(204).send(); // 204: deu certo e não há conteúdo para devolver
  } catch (error) {
    responderErro(res, error);
  }
}

module.exports = { listarTurmas, criarTurma, atualizarTurma, excluirTurma };