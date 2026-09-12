const express = require('express');
const app = express();
const PORT = 3000;

// Cria rota de teste
app.get('/api/teste', (req, res) => {
    res.send('ClassSync API funcionando!');
});

// Inicializa o servidor na porta 3000
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});