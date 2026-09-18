const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Dados simulados (Mock)
let acompanhamentosMock = [
    { id: 1, aluno: "João Silva", ra: "2026001", disciplina: "Estrutura de Dados", media: 8.5, status: "Publicado", tags: ["Excelente"] },
    { id: 2, aluno: "Maria Souza", ra: "2026002", disciplina: "Desenvolvimento Web", media: 5.0, status: "Rascunho", tags: ["Atenção"] }
];

// Cria rota de teste
app.get('/api/teste', (req, res) => {
    res.send('ClassSync API funcionando!');
});

// Cria rota real para o Frontend consumir (Listar alunos/relatórios)
app.get('/api/acompanhamentos', (req, res) => {
    res.json(acompanhamentosMock);
});

// Cria rota real para o Frontend enviar dados (Formulário do Professor)
app.post('/api/acompanhamentos', (req, res) => {
    const { aluno, ra, disciplina, media } = req.body;
    
    // Validação simples no backend
    if (!aluno || !ra || !disciplina || !media) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }
    
    const novoAcompanhamento = { 
        id: Date.now(), 
        aluno, 
        ra, 
        disciplina, 
        media: Number(media), 
        status: "Enviado para revisão", 
        tags: [] 
    };
    
    acompanhamentosMock.push(novoAcompanhamento);
    res.status(201).json(novoAcompanhamento);
});

// Inicializa o servidor na porta 3000
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});