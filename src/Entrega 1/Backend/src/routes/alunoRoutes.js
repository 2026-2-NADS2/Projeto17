const express = require("express");
const { listarAlunos, buscarAluno, criarAluno } = require("../controllers/alunoController");

const router = express.Router();

router.get("/", listarAlunos);
router.get("/:id", buscarAluno);
router.post("/", criarAluno);

module.exports = router;