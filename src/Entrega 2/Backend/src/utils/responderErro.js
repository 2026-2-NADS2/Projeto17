const ErroApp = require("../errors/ErroApp");

// Erro esperado (ErroApp) → status e mensagem dele. Qualquer outro → 500 genérico.
function responderErro(res, error) {
  if (error instanceof ErroApp) {
    return res.status(error.status).json({ erro: error.message });
  }
  console.error(error);
  return res.status(500).json({ erro: "Erro interno no servidor." });
}

module.exports = responderErro;