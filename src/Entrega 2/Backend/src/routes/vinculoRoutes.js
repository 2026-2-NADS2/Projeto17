const express = require("express");
const { listarVinculos, criarVinculo, excluirVinculo } = require("../controllers/vinculoController");
const { autenticar, exigirPerfil } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", autenticar, exigirPerfil("ADMIN", "PROFESSOR"), listarVinculos);
router.post("/", autenticar, exigirPerfil("ADMIN"), criarVinculo);
router.delete("/:id", autenticar, exigirPerfil("ADMIN"), excluirVinculo);

module.exports = router;