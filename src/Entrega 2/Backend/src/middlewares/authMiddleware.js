const jwt = require("jsonwebtoken");

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não informado." });
  }

  try {
    const token = cabecalho.split(" ")[1];
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}

module.exports = { autenticar };