const express = require("express");
const {
  listarAcompanhamentos,
  buscarAcompanhamento,
  criarAcompanhamento,
  enviarParaRevisao,
  publicarAcompanhamento,
  excluirAcompanhamento,
} = require("../controllers/acompanhamentoController");
const { autenticar, exigirPerfil } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", autenticar, listarAcompanhamentos);
router.get("/:id", autenticar, buscarAcompanhamento);
router.post("/", autenticar, exigirPerfil("PROFESSOR"), criarAcompanhamento);
router.patch("/:id/enviar", autenticar, exigirPerfil("PROFESSOR"), enviarParaRevisao);
router.patch("/:id/publicar", autenticar, exigirPerfil("ADMIN"), publicarAcompanhamento);
router.delete("/:id", autenticar, exigirPerfil("ADMIN"), excluirAcompanhamento);

module.exports = router;