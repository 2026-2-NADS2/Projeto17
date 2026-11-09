const express = require("express");
const { listarRetornos, registrarCiencia, atualizarObservacao } = require("../controllers/cienciaController");
const { autenticar, exigirPerfil } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/retornos", autenticar, listarRetornos);
router.post("/acompanhamentos/:id/ciencia", autenticar, exigirPerfil("RESPONSAVEL"), registrarCiencia);
router.patch("/acompanhamentos/:id/ciencia", autenticar, exigirPerfil("RESPONSAVEL"), atualizarObservacao);

module.exports = router;