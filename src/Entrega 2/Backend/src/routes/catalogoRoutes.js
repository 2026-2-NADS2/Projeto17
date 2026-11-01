const express = require("express");
const { autenticar } = require("../middlewares/authMiddleware");
const { listarTags, listarDisciplinas, listarTurmas, listarBimestres } = require("../controllers/catalogoController");

const router = express.Router();

router.get("/tags", autenticar, listarTags);
router.get("/disciplinas", autenticar, listarDisciplinas);
router.get("/turmas", autenticar, listarTurmas);
router.get("/bimestres", autenticar, listarBimestres);

module.exports = router;