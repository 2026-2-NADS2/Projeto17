const express = require("express");
const { listarAlunos, buscarAluno, criarAluno, atualizarAluno, excluirAluno } = require("../controllers/alunoController");
const router = express.Router();

router.get("/", listarAlunos);
router.get("/:id", buscarAluno);
router.post("/", criarAluno);
router.put("/:id", atualizarAluno);
router.delete("/:id", excluirAluno);

module.exports = router;