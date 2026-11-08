const VinculoService = require("../services/VinculoService");
const responderErro = require("../utils/responderErro");

async function listarVinculos(req, res) {
  try {
    res.status(200).json(await VinculoService.listarVinculos(req.usuario, req.query));
  } catch (error) {
    responderErro(res, error);
  }
}

async function criarVinculo(req, res) {
  try {
    res.status(201).json(await VinculoService.criarVinculo(req.body));
  } catch (error) {
    responderErro(res, error);
  }
}

async function excluirVinculo(req, res) {
  try {
    await VinculoService.excluirVinculo(req.params.id);
    res.status(204).send();
  } catch (error) {
    responderErro(res, error);
  }
}

module.exports = { listarVinculos, criarVinculo, excluirVinculo };