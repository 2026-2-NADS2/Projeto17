const express = require("express");
const { listarTags, criarTag, atualizarTag, excluirTag } = require("../controllers/tagController");
const { autenticar, exigirPerfil } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", autenticar, listarTags);
router.post("/", autenticar, exigirPerfil("ADMIN"), criarTag);
router.put("/:id", autenticar, exigirPerfil("ADMIN"), atualizarTag);
router.delete("/:id", autenticar, exigirPerfil("ADMIN"), excluirTag);

module.exports = router;