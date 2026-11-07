const BimestreService = require("../services/BimestreService");
const responderErro = require("../utils/responderErro");

async function listarBimestres(req, res) {
  try {
    res.status(200).json(await BimestreService.listarBimestres(req.query));
  } catch (error) {
    responderErro(res, error);
  }
}

async function atualizarPeriodo(req, res) {
  try {
    res.status(200).json(await BimestreService.atualizarPeriodo(req.params.id, req.body));
  } catch (error) {
    responderErro(res, error);
  }
}

module.exports = { listarBimestres, atualizarPeriodo };