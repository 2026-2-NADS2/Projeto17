require("dotenv").config();
const express = require("express");
const cors = require("cors");

const alunoRoutes = require("./routes/alunoRoutes");
const acompanhamentoRoutes = require("./routes/acompanhamentoRoutes");
const authRoutes = require("./routes/authRoutes");
const catalogoRoutes = require("./routes/catalogoRoutes");
const turmaRoutes = require("./routes/turmaRoutes");
const pool = require("./config/database");

const app = express();

// No Render, a porta vem da variável PORT. No computador, usa 3000.
const PORT = process.env.PORT || 3000;

// CORS: só os endereços de frontend permitidos podem chamar a API pelo navegador.
// FRONTEND_URL aceita mais de um endereço separado por vírgula.
const origensPermitidas = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origem) => origem.trim())
  .filter(Boolean);

app.use(cors({ origin: origensPermitidas }));
app.use(express.json());

app.use("/api/alunos", alunoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/acompanhamentos", acompanhamentoRoutes);
app.use("/api", catalogoRoutes);
app.use("/api/turmas", turmaRoutes);

// Rota de teste da conexão com o banco
app.get("/api/teste-banco", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ mensagem: "Conexão com o banco funcionando!" });
  } catch (error) {
    console.error(error); // o detalhe fica só no log do servidor
    res.status(500).json({ erro: "Erro ao conectar com o banco." });
  }
});

// Rota de teste da API
app.get("/api/teste", (req, res) => {
  res.send("ClassSync API funcionando!");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});