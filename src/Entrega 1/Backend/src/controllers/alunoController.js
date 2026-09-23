const AlunoService = require("../services/AlunoService");

async function listarAlunos(req, res) {
  try {
    const alunos = await AlunoService.listarAlunos();
    res.status(200).json(alunos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar alunos." });
  }
}

async function buscarAluno(req, res) {
  try {
    const aluno = await AlunoService.buscarAlunoPorId(req.params.id);
    res.status(200).json(aluno);
  } catch (error) {
    res.status(404).json({ erro: error.message });
  }
}

async function criarAluno(req, res) {
  try {
    const aluno = await AlunoService.cadastrarAluno(req.body);
    res.status(201).json(aluno);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
}

module.exports = { listarAlunos, buscarAluno, criarAluno };