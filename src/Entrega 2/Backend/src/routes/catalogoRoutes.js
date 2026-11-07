const express = require("express");
const { autenticar } = require("../middlewares/authMiddleware");
const { listarTags, listarBimestres } = require("../controllers/catalogoController");

const router = express.Router();

router.get("/tags", autenticar, listarTags);
router.get("/bimestres", autenticar, listarBimestres);

module.exports = router;