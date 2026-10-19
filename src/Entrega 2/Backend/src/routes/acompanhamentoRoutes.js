const express = require("express");
const {
  listarAcompanhamentos,
  buscarAcompanhamento,
  criarAcompanhamento,
  enviarParaRevisao,
  publicarAcompanhamento,
  excluirAcompanhamento,
} = require("../controllers/acompanhamentoController");

const router = express.Router();

router.get("/", listarAcompanhamentos);
router.get("/:id", buscarAcompanhamento);
router.post("/", criarAcompanhamento);
router.patch("/:id/enviar", enviarParaRevisao);
router.patch("/:id/publicar", publicarAcompanhamento);
router.delete("/:id", excluirAcompanhamento);

module.exports = router;