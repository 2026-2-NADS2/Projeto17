const express = require("express");
const { listarBimestres, atualizarPeriodo } = require("../controllers/bimestreController");
const { autenticar, exigirPerfil } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", autenticar, listarBimestres);
router.put("/:id", autenticar, exigirPerfil("ADMIN"), atualizarPeriodo);

module.exports = router;