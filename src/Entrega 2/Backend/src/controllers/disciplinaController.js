const DisciplinaService = require("../services/DisciplinaService");
const responderErro = require("../utils/responderErro");

async function listarAreas(req, res) {
  try {
    res.status(200).json(await DisciplinaService.listarAreas());
  } catch (error) {
    responderErro(res, error);
  }
}

async function criarArea(req, res) {
  try {
    res.status(201).json(await DisciplinaService.criarArea(req.body));
  } catch (error) {
    responderErro(res, error);
  }
}

async function listarDisciplinas(req, res) {
  try {
    res.status(200).json(await DisciplinaService.listarDisciplinas());
  } catch (error) {
    responderErro(res, error);
  }
}

async function criarDisciplina(req, res) {
  try {
    res.status(201).json(await DisciplinaService.criarDisciplina(req.body));
  } catch (error) {
    responderErro(res, error);
  }
}

async function atualizarDisciplina(req, res) {
  try {
    res.status(200).json(await DisciplinaService.atualizarDisciplina(req.params.id, req.body));
  } catch (error) {
    responderErro(res, error);
  }
}

async function excluirDisciplina(req, res) {
  try {
    await DisciplinaService.excluirDisciplina(req.params.id);
    res.status(204).send();
  } catch (error) {
    responderErro(res, error);
  }
}

module.exports = {
  listarAreas,
  criarArea,
  listarDisciplinas,
  criarDisciplina,
  atualizarDisciplina,
  excluirDisciplina,
};