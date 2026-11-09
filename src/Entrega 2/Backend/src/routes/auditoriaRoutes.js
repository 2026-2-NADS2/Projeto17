const express = require("express");
const { listarAuditoria } = require("../controllers/auditoriaController");
const { autenticar, exigirPerfil } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", autenticar, exigirPerfil("ADMIN"), listarAuditoria);

module.exports = router;