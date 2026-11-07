const express = require("express");
const {
  listarAreas,
  criarArea,
  listarDisciplinas,
  criarDisciplina,
  atualizarDisciplina,
  excluirDisciplina,
} = require("../controllers/disciplinaController");
const { autenticar, exigirPerfil } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/areas", autenticar, listarAreas);
router.post("/areas", autenticar, exigirPerfil("ADMIN"), criarArea);

router.get("/disciplinas", autenticar, listarDisciplinas);
router.post("/disciplinas", autenticar, exigirPerfil("ADMIN"), criarDisciplina);
router.put("/disciplinas/:id", autenticar, exigirPerfil("ADMIN"), atualizarDisciplina);
router.delete("/disciplinas/:id", autenticar, exigirPerfil("ADMIN"), excluirDisciplina);

module.exports = router;