const CienciaService = require("../services/CienciaService");
const responderErro = require("../utils/responderErro");

async function listarRetornos(req, res) {
  try {
    res.status(200).json(await CienciaService.listarRetornos(req.usuario, req.query));
  } catch (error) {
    responderErro(res, error);
  }
}

async function registrarCiencia(req, res) {
  try {
    res.status(201).json(await CienciaService.registrarCiencia(req.params.id, req.body, req.usuario));
  } catch (error) {
    responderErro(res, error);
  }
}

module.exports = { listarRetornos, registrarCiencia };