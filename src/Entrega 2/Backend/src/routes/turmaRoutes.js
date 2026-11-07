const express = require("express");
const { listarTurmas, criarTurma, atualizarTurma, excluirTurma } = require("../controllers/turmaController");
const { autenticar, exigirPerfil } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", autenticar, listarTurmas);
router.post("/", autenticar, exigirPerfil("ADMIN"), criarTurma);
router.put("/:id", autenticar, exigirPerfil("ADMIN"), atualizarTurma);
router.delete("/:id", autenticar, exigirPerfil("ADMIN"), excluirTurma);

module.exports = router;