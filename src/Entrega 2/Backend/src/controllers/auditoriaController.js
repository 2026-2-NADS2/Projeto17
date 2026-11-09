const AuditoriaService = require("../services/AuditoriaService");
const responderErro = require("../utils/responderErro");

async function listarAuditoria(req, res) {
  try {
    res.status(200).json(await AuditoriaService.listarAuditoria());
  } catch (error) {
    responderErro(res, error);
  }
}

module.exports = { listarAuditoria };