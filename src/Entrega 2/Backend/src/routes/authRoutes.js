const express = require("express");
const {
  login,
  cadastrarUsuario,
  listarUsuarios,
  alterarSenha,
  solicitarRecuperacao,
  redefinirSenha,
} = require("../controllers/authController");
const { autenticar, exigirPerfil } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/usuarios", autenticar, exigirPerfil("ADMIN"), cadastrarUsuario);
router.get("/usuarios", autenticar, exigirPerfil("ADMIN"), listarUsuarios);
router.patch("/senha", autenticar, alterarSenha);

// Recuperação de senha: rotas públicas (quem esqueceu a senha não tem token)
router.post("/recuperar-senha", solicitarRecuperacao);
router.post("/redefinir-senha", redefinirSenha);
module.exports = router;