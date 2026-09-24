const express = require('express');
const cors = require('cors');
const app = express();
const alunoRoutes = require("./routes/alunoRoutes");
const acompanhamentoRoutes = require("./routes/acompanhamentoRoutes");
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/api/alunos", alunoRoutes);
app.use("/api/acompanhamentos", acompanhamentoRoutes);
const pool = require("./config/database");

// Rota de teste para verificar a conexão com o banco de dados
app.get("/api/teste-banco", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM aluno");
    res.json({ mensagem: "Conexão com o banco funcionando!", total_alunos: rows[0].total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao conectar com o banco.", detalhes: error.message });
  }
});

// Cria rota de teste
app.get('/api/teste', (req, res) => {
    res.send('ClassSync API funcionando!');
});

// Inicializa o servidor na porta 3000
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});