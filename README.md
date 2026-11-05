# FECAP - Fundação Escola de Comércio Álvares Penteado

<p align="center">
  <a href= "https://www.fecap.br/"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhZPrRa89Kma0ZZogxm0pi-tCn_TLKeHGVxywp-LXAFGR3B1DPouAJYHgKZGV0XTEf4AE&usqp=CAU" alt="FECAP - Fundação de Comércio Álvares Penteado" border="0"></a>
</p>

# ClassSync — Plataforma de Acompanhamento Escolar

## Nome do Grupo: **ClassSync**

## Integrantes: <a href="https://github.com/matheusggdev">Matheus Gajewski de Melo</a>, <a href="https://github.com/melolivaa">Mel Oliva Motta</a>, <a href="https://github.com/Raynafroes">Rayna Guimarães Froes</a>

## Professores Orientadores: <a href="https://www.linkedin.com/in/adriano-valente/">Adriano Valente</a>, <a href="https://www.linkedin.com/in/eduardo-savino/">Eduardo Savino</a>, <a href="https://www.linkedin.com/in/francisco-escobar/">Francisco Escobar</a>, <a href="https://www.linkedin.com/in/jbuesso/">José Buesso</a>, <a href="https://www.linkedin.com/in/ronaldo-araujo-pinto-3542811a/">Ronaldo Araújo</a>

## Status do Projeto: Em desenvolvimento 🚧

## 🌐 Acesse o sistema

| | Endereço |
| --- | --- |
| **Aplicação web** | https://classsync-escolar.vercel.app |

## Descrição

<p align="center">
<img src="imagens/Logo/BANNER - ClassSync.png" alt="BANNER-ClassSync" border="0">
</p>

O ClassSync é uma plataforma web responsiva desenvolvida para auxiliar escolas de ensino fundamental no acompanhamento do desempenho acadêmico dos alunos e na comunicação entre professores, escola e pais ou responsáveis. A plataforma centraliza os acompanhamentos bimestrais, permitindo que professores registrem médias, descrições e tags sobre o desempenho dos alunos, enquanto a administração gerencia os dados escolares e revisa os registros antes da publicação.
<br><br>
O sistema possui três perfis: Administrador, Professor e Pai/Responsável, cada um com permissões específicas. Após a revisão e publicação pelo administrador, os responsáveis podem consultar os acompanhamentos dos alunos vinculados.
<br><br>

## ✨ Funcionalidades

**Professor**
- Registro do acompanhamento bimestral: turma, aluno, disciplina, descrição, média e múltiplas tags.
- Salvamento como rascunho, edição e envio para revisão, com validação dos campos.
- Lista de acompanhamentos com abas por status, filtros, busca e paginação.
- Correção e reenvio de registros devolvidos pela administração, com o motivo da devolução.
- Painel inicial com indicadores, progresso do bimestre, rascunhos e períodos de digitação.

**Administrador**
- Revisão dos acompanhamentos enviados: publicação ou devolução com motivo obrigatório.
- Cadastro de usuários e consulta por perfil.

**Pai/Responsável**
- Consulta apenas dos acompanhamentos **publicados** dos alunos vinculados ao seu cadastro.

**Regras e segurança**
- Autenticação com JWT (expiração de 2 horas) e senhas armazenadas com bcrypt.
- Controle de acesso por perfil em cada rota da API.
- Registro permitido somente durante o período de digitação aberto do bimestre.
- Um acompanhamento por aluno, disciplina e bimestre.
- Fluxo de status: Rascunho → Enviado → Publicado, com devolução para ajustes.
- Consultas parametrizadas (proteção contra SQL Injection) e respostas de erro padronizadas.

## 🏗️ Arquitetura

| Camada | Tecnologia | Hospedagem |
| --- | --- | --- |
| Frontend | React + Vite | Vercel |
| Backend (API REST) | Node.js + Express | Render |
| Banco de dados | MySQL 8 | Aiven |

O backend é organizado em camadas: **routes → controllers → services → repositories → banco**, com as regras de negócio nos **models** e nos **services**.

## 📁 Estrutura de pastas

-Raiz<br>
|<br>
|-->documentos<br>
|  &emsp;|-->Entrega 1<br>
|  &emsp;|-->Entrega 2<br>
|  &emsp; &emsp;|-->BD<br>
|  &emsp; &emsp;|-->Desenvolvimento Web Fullstack<br>
|  &emsp; &emsp;|-->Design de Interface Digital<br>
|  &emsp; &emsp;|-->Estrutura de Dados<br>
|  &emsp; &emsp;|-->POO<br>
|  &emsp;|-->Documento - Projeto de Extensão - COM Empresa - 2026_1.docx<br>
|  &emsp;|-->MODELO_BANNER_FECAP_2026_1.pptx<br>
|<br>
|-->imagens<br>
|  &emsp;|-->Logo<br>
|<br>
|-->src<br>
|  &emsp;|-->Entrega 1 (versão anterior, mantida como histórico)<br>
|  &emsp;|-->Entrega 2<br>
|  &emsp; &emsp;|-->Backend<br>
|  &emsp; &emsp;&emsp;|-->database (scripts SQL)<br>
|  &emsp; &emsp;&emsp;|-->src<br>
|  &emsp; &emsp;&emsp;&emsp;|-->config (conexão com o banco)<br>
|  &emsp; &emsp;&emsp;&emsp;|-->controllers<br>
|  &emsp; &emsp;&emsp;&emsp;|-->errors<br>
|  &emsp; &emsp;&emsp;&emsp;|-->middlewares (autenticação e perfis)<br>
|  &emsp; &emsp;&emsp;&emsp;|-->models<br>
|  &emsp; &emsp;&emsp;&emsp;|-->repositories<br>
|  &emsp; &emsp;&emsp;&emsp;|-->routes<br>
|  &emsp; &emsp;&emsp;&emsp;|-->scripts (criação do administrador)<br>
|  &emsp; &emsp;&emsp;&emsp;|-->services<br>
|  &emsp; &emsp;&emsp;&emsp;|-->server.js<br>
|  &emsp; &emsp;&emsp;|-->.env.example<br>
|  &emsp; &emsp;|-->Frontend<br>
|  &emsp; &emsp;&emsp;|-->public<br>
|  &emsp; &emsp;&emsp;|-->src<br>
|  &emsp; &emsp;&emsp;&emsp;|-->assets<br>
|  &emsp; &emsp;&emsp;&emsp;|-->components<br>
|  &emsp; &emsp;&emsp;&emsp;|-->pages<br>
|  &emsp; &emsp;&emsp;&emsp;|-->services (comunicação com a API)<br>
|  &emsp; &emsp;&emsp;|-->.env.example<br>
|  &emsp; &emsp;&emsp;|-->vercel.json<br>
|<br>
|.gitignore<br>
|readme.md<br>

## 💻 Configuração para Desenvolvimento

### Pré-requisitos
- Node.js instalado (verifique com `node -v`)
- MySQL Server 8.0 instalado e rodando
- Git instalado

### 1. Clonar o repositório

```bash
git clone https://github.com/2026-2-NADS2/Projeto17.git
cd Projeto17
```

### 2. Configurar o Banco de Dados

1. Abra o MySQL Workbench (ou outro cliente de sua preferência).
2. Execute o script `src/Entrega 2/Backend/database/schema.sql` para criar o banco `classsync`, suas tabelas, índices e views.

### 3. Configurar o Backend

```bash
cd "src/Entrega 2/Backend"
npm install
```

Crie um arquivo `.env` dentro da pasta `Backend`, copiando o modelo `.env.example`, e preencha:

| Variável | Descrição |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexão com o MySQL (local: `localhost`, `3306`, `root`, sua senha, `classsync`) |
| `DB_SSL_CA_PATH` / `DB_SSL_CA` | Certificado SSL, apenas para banco na nuvem. Deixe vazio no banco local |
| `PORT` | Porta da API (padrão `3000`) |
| `FRONTEND_URL` | Endereço(s) do frontend liberados no CORS, separados por vírgula. Vazio = `http://localhost:5173` |
| `JWT_SECRET` | Chave secreta para assinar os tokens (use um texto longo e aleatório) |
| `ADMIN_EMAIL`, `ADMIN_SENHA` | Dados do administrador inicial |

> O arquivo `.env` contém senhas e **nunca** deve ser enviado ao repositório.

Crie o administrador inicial:

```bash
node src/scripts/criarAdmin.js
```

### 4. Rodar o Backend

```bash
npm run dev
```

O servidor inicia em `http://localhost:3000` e reinicia automaticamente a cada alteração (nodemon). Para confirmar que está funcionando, acesse `http://localhost:3000/api/teste`.

### 5. Configurar e rodar o Frontend

Em um novo terminal:

```bash
cd "src/Entrega 2/Frontend"
npm install
npm run dev
```

O frontend inicia em `http://localhost:5173` e, sem configuração adicional, usa a API local. Para apontar para outra API, crie um `.env` a partir do `.env.example` e preencha `VITE_API_URL`.

> O Backend e o Frontend precisam estar rodando **ao mesmo tempo**, em terminais separados.

## 🔌 Principais rotas da API

Todas as rotas, exceto o login, exigem o cabeçalho `Authorization: Bearer <token>`. Erros seguem o formato `{ "erro": "mensagem" }`.

| Método | Rota | Perfil | Descrição |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | público | Login, retorna o token JWT |
| GET / POST | `/api/auth/usuarios` | Admin | Lista (filtro `?perfil=`) e cadastra usuários |
| GET | `/api/acompanhamentos` | todos | Lista conforme o perfil (filtros `?status=` e `?idAluno=`) |
| GET | `/api/acompanhamentos/:id` | todos | Detalha um acompanhamento |
| POST | `/api/acompanhamentos` | Professor | Cria um rascunho |
| PUT | `/api/acompanhamentos/:id` | Professor | Edita rascunho ou devolvido |
| PATCH | `/api/acompanhamentos/:id/enviar` | Professor | Envia para revisão |
| PATCH | `/api/acompanhamentos/:id/devolver` | Admin | Devolve com motivo |
| PATCH | `/api/acompanhamentos/:id/publicar` | Admin | Publica para a família |
| GET | `/api/alunos` | todos | Lista alunos (o responsável vê só os vinculados) |
| GET | `/api/tags`, `/api/disciplinas`, `/api/turmas`, `/api/bimestres` | todos | Listas de apoio aos formulários |

A coleção do Postman com os testes da API está em `documentos/Entrega 2/Desenvolvimento Web Fullstack`.

## 🚀 Deploy

| Serviço | Plataforma | Variáveis configuradas no painel |
| --- | --- | --- |
| Backend | Render (Root Directory: `src/Entrega 2/Backend`, start: `npm start`) | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL_CA`, `JWT_SECRET`, `FRONTEND_URL` |
| Frontend | Vercel (Vite) | `VITE_API_URL` |
| Banco | Aiven (MySQL, conexão com SSL) | — |

**Atualizar a versão publicada após um merge na `main`:**
- **Backend:** painel do Render → serviço `classsync-api` → **Manual Deploy → Deploy latest commit**.
- **Frontend:** na pasta `src/Entrega 2/Frontend`, rodar `npx vercel --prod`.

## 🛠️ Tecnologias e Ferramentas Utilizadas

<div style="display: inline_block">
  <img align="center" alt="logo-html" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" />
  <img align="center" alt="logo-css" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" />
  <img align="center" alt="logo-js" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" />
  <img align="center" alt="logo-react" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" />
  <img align="center" alt="logo-node" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" />
  <img align="center" alt="logo-express" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg" />
  <img align="center" alt="logo-mysql" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg" />
  <img align="center" alt="logo-postman" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postman/postman-original.svg" />
  <img align="center" alt="logo-figma" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg" />
  <img align="center" alt="logo-vscode" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg" />
</div>

Bibliotecas principais: React Router, Axios, Lucide (ícones), Express, mysql2, bcrypt, jsonwebtoken, dotenv e cors.

## 📋 Licença/License
<a href="https://github.com/2026-2-NADS2/Projeto17">ClassSync</a> © 2026 by <a href="https://github.com/matheusggdev">Matheus Gajewski de Melo, Mel Oliva Motta, Rayna Guimarães Froes</a> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
<br>
<img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;"><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;">

## 🎓 Referências

Aqui estão as referências usadas no projeto.

1. <https://github.com/iuricode/readme-template>
2. <https://github.com/gabrieldejesus/readme-model>
3. <https://chooser-beta.creativecommons.org/>
4. <https://freesound.org/>
5. <https://www.toptal.com/developers/gitignore>
6. Músicas por: <a href="https://freesound.org/people/DaveJf/sounds/616544/"> DaveJf </a> e <a href="https://freesound.org/people/DRFX/sounds/338986/"> DRFX </a> ambas com Licença CC 0.
