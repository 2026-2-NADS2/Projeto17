const express = require("express");
const { login, cadastrarUsuario, listarUsuarios, alterarSenha } = require("../controllers/authController");
const { autenticar, exigirPerfil } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/usuarios", autenticar, exigirPerfil("ADMIN"), cadastrarUsuario);
router.get("/usuarios", autenticar, exigirPerfil("ADMIN"), listarUsuarios);
router.patch("/senha", autenticar, alterarSenha);
module.exports = router;