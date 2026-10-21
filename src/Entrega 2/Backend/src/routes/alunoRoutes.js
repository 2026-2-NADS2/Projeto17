const express = require("express");
const {
  listarAlunos,
  buscarAluno,
  criarAluno,
  atualizarAluno,
  excluirAluno,
} = require("../controllers/alunoController");
const { autenticar, exigirPerfil } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", autenticar, listarAlunos);
router.get("/:id", autenticar, buscarAluno);
router.post("/", autenticar, exigirPerfil("ADMIN"), criarAluno);
router.put("/:id", autenticar, exigirPerfil("ADMIN"), atualizarAluno);
router.delete("/:id", autenticar, exigirPerfil("ADMIN"), excluirAluno);

module.exports = router;