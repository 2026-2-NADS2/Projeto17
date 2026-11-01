const express = require("express");
const { autenticar, exigirPerfil } = require("../middlewares/authMiddleware");
const {
  listarAcompanhamentos,
  buscarAcompanhamento,
  criarAcompanhamento,
  atualizarAcompanhamento,
  enviarParaRevisao,
  devolverAcompanhamento,
  publicarAcompanhamento,
  excluirAcompanhamento,
} = require("../controllers/acompanhamentoController");

const router = express.Router();

router.get("/", autenticar, listarAcompanhamentos);
router.get("/:id", autenticar, buscarAcompanhamento);
router.post("/", autenticar, exigirPerfil("PROFESSOR"), criarAcompanhamento);
router.put("/:id", autenticar, exigirPerfil("PROFESSOR"), atualizarAcompanhamento);
router.patch("/:id/enviar", autenticar, exigirPerfil("PROFESSOR"), enviarParaRevisao);
router.patch("/:id/devolver", autenticar, exigirPerfil("ADMIN"), devolverAcompanhamento);
router.patch("/:id/publicar", autenticar, exigirPerfil("ADMIN"), publicarAcompanhamento);
router.delete("/:id", autenticar, exigirPerfil("ADMIN"), excluirAcompanhamento);

module.exports = router;