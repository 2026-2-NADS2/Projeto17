const express = require("express");
const { login, cadastrarUsuario, listarUsuarios } = require("../controllers/authController");
const { autenticar, exigirPerfil } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/usuarios", autenticar, exigirPerfil("ADMIN"), cadastrarUsuario);
router.get("/usuarios", autenticar, exigirPerfil("ADMIN"), listarUsuarios);

module.exports = router;