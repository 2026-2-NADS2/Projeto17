const TagService = require("../services/TagService");
const responderErro = require("../utils/responderErro");

async function listarTags(req, res) {
  try {
    res.status(200).json(await TagService.listarTags());
  } catch (error) {
    responderErro(res, error);
  }
}

async function criarTag(req, res) {
  try {
    res.status(201).json(await TagService.criarTag(req.body));
  } catch (error) {
    responderErro(res, error);
  }
}

async function atualizarTag(req, res) {
  try {
    res.status(200).json(await TagService.atualizarTag(req.params.id, req.body));
  } catch (error) {
    responderErro(res, error);
  }
}

async function excluirTag(req, res) {
  try {
    await TagService.excluirTag(req.params.id);
    res.status(204).send();
  } catch (error) {
    responderErro(res, error);
  }
}

module.exports = { listarTags, criarTag, atualizarTag, excluirTag };