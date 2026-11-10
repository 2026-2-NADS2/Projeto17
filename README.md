# FECAP - Fundação Escola de Comércio Álvares Penteado

<p align="center">
  <a href= "https://www.fecap.br/"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhZPrRa89Kma0ZZogxm0pi-tCn_TLKeHGVxywp-LXAFGR3B1DPouAJYHgKZGV0XTEf4AE&usqp=CAU" alt="FECAP - Fundação de Comércio Álvares Penteado" border="0"></a>
</p>

# ClassSync — Plataforma de Acompanhamento Escolar

## Nome do Grupo: **ClassSync**

## Integrantes: <a href="https://github.com/matheusggdev">Matheus Gajewski de Melo</a>, <a href="https://github.com/melolivaa">Mel Oliva Motta</a>, <a href="https://github.com/Raynafroes">Rayna Guimarães Froes</a>

## Professores Orientadores: <a href="https://www.linkedin.com/in/adriano-valente/">Adriano Valente</a>, <a href="https://www.linkedin.com/in/eduardo-savino/">Eduardo Savino</a>, <a href="https://www.linkedin.com/in/francisco-escobar/">Francisco Escobar</a>, <a href="https://www.linkedin.com/in/jbuesso/">José Buesso</a>, <a href="https://www.linkedin.com/in/ronaldo-araujo-pinto-3542811a/">Ronaldo Araújo</a>

## Status do Projeto: Publicado 🚀

## 🌐 Acesse o sistema

| | Endereço |
| --- | --- |
| **Aplicação web** | https://classsync-escolar.vercel.app |
| **API REST** | https://classsync-api-fngp.onrender.com/api |

<p align="center">
<img src="imagens/QRCode/qrcode-classsync.png" alt="QR code para acessar o ClassSync" width="160">
</p>

> A API usa o plano gratuito do Render: depois de um tempo sem uso, a primeira requisição pode levar cerca de 1 minuto enquanto o servidor "acorda".
>
> As contas de demonstração são apresentadas pelo grupo na avaliação; as senhas não ficam no repositório.

## Descrição

<p align="center">
<img src="imagens/Logo/BANNER - ClassSync.png" alt="BANNER-ClassSync" border="0">
</p>

O ClassSync é uma plataforma web responsiva desenvolvida para auxiliar escolas de ensino fundamental no acompanhamento do desempenho acadêmico dos alunos e na comunicação entre professores, escola e pais ou responsáveis. A plataforma centraliza os acompanhamentos bimestrais, permitindo que professores registrem médias, descrições e tags sobre o desempenho dos alunos, enquanto a administração gerencia os dados escolares e revisa os registros antes da publicação.
<br><br>
O sistema possui três perfis: Administrador, Professor e Pai/Responsável, cada um com permissões específicas. Após a revisão e publicação pelo administrador, os responsáveis podem consultar os acompanhamentos dos alunos vinculados.
<br><br>

## ✨ Funcionalidades

**Site público**
- Páginas Início, Serviços, Institucional, Contato e Política de Privacidade (LGPD).
- Login com redirecionamento para o módulo de cada perfil, aviso de sessão expirada e páginas de erro 403 e 404.
- Recuperação de senha por e-mail: o usuário recebe um link (válido por 30 minutos e de uso único) e cria uma nova senha.

**Professor**
- Painel com indicadores, progresso do bimestre por turma, rascunhos e registros devolvidos.
- Minhas turmas: turmas e disciplinas vinculadas, com os alunos de cada turma e filtros por disciplina, bimestre e status.
- Histórico do aluno: médias por bimestre, registros e retornos do responsável.
- Registro do acompanhamento bimestral (descrição, média e tags), com rascunho, edição e envio para revisão.
- Correção e reenvio dos registros devolvidos, com o motivo da devolução.
- Relatórios e retornos: indicadores por turma e as ciências e observações das famílias.
- Meu perfil com alteração de senha.

**Administrador**
- Visão geral com a situação dos acompanhamentos e a fila de revisão.
- Revisão e publicação: publicar ou devolver com motivo obrigatório.
- Retornos das famílias: ciências e observações registradas pelos responsáveis.
- Cadastros: usuários, alunos, professores, responsáveis, áreas e disciplinas, turmas e tags.
- Estrutura acadêmica: vínculos turma × disciplina × professor e períodos bimestrais (abertura e encerramento).
- Relatórios gerenciais com filtros e histórico/auditoria de todas as alterações.
- Exportação das listas em CSV (abre no Excel).

**Pai/Responsável**
- Início com o resumo dos alunos vinculados e os relatórios recentes.
- Relatórios **publicados** por aluno, com filtros por ano letivo, bimestre e disciplina, e versão para PDF.
- Registro de ciência ("li o relatório") e envio de observação para a escola.
- Meu perfil com alteração de senha.

**Regras e segurança**
- Autenticação com JWT (expiração de 2 horas) e senhas armazenadas com bcrypt.
- Link de recuperação de senha assinado com o hash da senha atual: expira em 30 minutos e deixa de valer assim que a senha é trocada.
- E-mails enviados pela API HTTP do Brevo (o plano gratuito do Render bloqueia SMTP).
- Controle de acesso por perfil em cada rota da API.
- O professor só registra acompanhamentos nas turmas e disciplinas em que tem vínculo.
- Registro permitido somente durante o período de digitação aberto do bimestre.
- Um acompanhamento por aluno, disciplina e bimestre.
- Fluxo de status: Rascunho → Enviado → Publicado, com devolução para ajustes.
- O responsável só acessa os alunos vinculados a ele: dados de outras famílias retornam 404.
- Histórico de alterações gravado por triggers no banco (auditoria).
- Consultas parametrizadas (proteção contra SQL Injection) e respostas de erro padronizadas.
- Interface responsiva, do celular (320 px) ao desktop.

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
|  &emsp; &emsp;|-->BD<br>
|  &emsp; &emsp;|-->Desenvolvimento Web Fullstack<br>
|  &emsp; &emsp;|-->Design de Interface Digital<br>
|  &emsp; &emsp;|-->Estrutura de Dados<br>
|  &emsp; &emsp;|-->POO<br>
|  &emsp;|-->Entrega 2<br>
|  &emsp; &emsp;|-->BD<br>
|  &emsp; &emsp;|-->Desenvolvimento Web Fullstack<br>
|  &emsp; &emsp;|-->Design de Interface Digital<br>
|  &emsp; &emsp;|-->Estrutura de Dados<br>
|  &emsp; &emsp;|-->POO<br>
|  &emsp;|-->Documento - Projeto de Extensão - COM Empresa - 2026_1.docx<br>
|  &emsp;|-->Etapas 1 e 2 da PI.pdf<br>
|  &emsp;|-->MODELO_BANNER_FECAP_2026_1.pptx<br>
|  &emsp;|-->README.md<br>
|<br>
|-->imagens<br>
|  &emsp;|-->Logo<br>
|  &emsp;|-->QRCode<br>
|<br>
|-->src<br>
|  &emsp;|-->Entrega 1 (versão anterior, mantida como histórico)<br>
|  &emsp;|-->Entrega 2<br>
|  &emsp; &emsp;|-->Backend<br>
|  &emsp; &emsp;&emsp;|-->database (schema.sql e migrações)<br>
|  &emsp; &emsp;&emsp;|-->src<br>
|  &emsp; &emsp;&emsp;&emsp;|-->config (conexão com o banco)<br>
|  &emsp; &emsp;&emsp;&emsp;|-->controllers<br>
|  &emsp; &emsp;&emsp;&emsp;|-->errors<br>
|  &emsp; &emsp;&emsp;&emsp;|-->middlewares (autenticação e perfis)<br>
|  &emsp; &emsp;&emsp;&emsp;|-->models<br>
|  &emsp; &emsp;&emsp;&emsp;|-->repositories<br>
|  &emsp; &emsp;&emsp;&emsp;|-->routes<br>
|  &emsp; &emsp;&emsp;&emsp;|-->scripts (criação do administrador e carga de demonstração)<br>
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
2. Execute o script `src/Entrega 2/Backend/database/schema.sql` para criar o banco `classsync`, suas tabelas, índices, views e triggers.

> O `schema.sql` já cria o banco na versão mais recente. Os arquivos da pasta `database/migracoes` servem **apenas** para atualizar um banco criado antes de cada mudança; quem cria o banco agora não precisa executá-los.

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
| `BREVO_API_KEY`, `EMAIL_REMETENTE`, `EMAIL_REMETENTE_NOME` | Envio dos e-mails de recuperação de senha pelo Brevo (chave da API e remetente verificado). Sem elas, o resto do sistema funciona, mas o e-mail não é enviado |
| `DEMO_SENHA_PROFESSOR`, `DEMO_SENHA_RESPONSAVEL` | Senhas das contas de demonstração criadas pela carga (8 a 72 caracteres, com letras e números; as duas devem ser diferentes) |

> O arquivo `.env` contém senhas e **nunca** deve ser enviado ao repositório.

Crie o administrador inicial:

```bash
node src/scripts/criarAdmin.js
```

Opcional, mas recomendado para testar: carregue os dados de demonstração (uma escola fictícia com turmas, alunos, professores, responsáveis e acompanhamentos). A carga **apaga todos os dados do banco, menos o administrador**:

```bash
node src/scripts/cargaDemonstracao.js --confirmar
```

Ao final, o terminal lista os e-mails das contas de demonstração. As senhas são as definidas no `.env`.

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

## 🔌 Rotas da API

Todas as rotas, exceto o login e a recuperação de senha, exigem o cabeçalho `Authorization: Bearer <token>`. Erros seguem o formato `{ "erro": "mensagem" }`.

| Método | Rota | Perfil | Descrição |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | público | Login, retorna o token JWT |
| GET / POST | `/api/auth/usuarios` | Admin | Lista (filtro `?perfil=`) e cadastra usuários |
| PATCH | `/api/auth/senha` | todos | Altera a própria senha |
| POST | `/api/auth/recuperar-senha` | público | Envia o link de redefinição por e-mail (mesma resposta para e-mail cadastrado ou não) |
| POST | `/api/auth/redefinir-senha` | público | Cria a nova senha com o token do link |
| GET | `/api/acompanhamentos` | todos | Lista conforme o perfil (filtros `?status=` e `?idAluno=`) |
| GET | `/api/acompanhamentos/:id` | todos | Detalha um acompanhamento |
| POST | `/api/acompanhamentos` | Professor | Cria um rascunho (exige vínculo e bimestre aberto) |
| PUT | `/api/acompanhamentos/:id` | Professor | Edita rascunho ou devolvido |
| PATCH | `/api/acompanhamentos/:id/enviar` | Professor | Envia para revisão |
| PATCH | `/api/acompanhamentos/:id/devolver` | Admin | Devolve com motivo |
| PATCH | `/api/acompanhamentos/:id/publicar` | Admin | Publica para a família |
| DELETE | `/api/acompanhamentos/:id` | Admin | Exclui um acompanhamento |
| POST / PATCH | `/api/acompanhamentos/:id/ciencia` | Responsável | Registra a ciência e a observação |
| GET | `/api/retornos` | todos | Ciências e observações (filtradas por perfil) |
| GET / POST / PUT / DELETE | `/api/alunos` | GET: todos · demais: Admin | Alunos (o responsável vê só os vinculados) |
| GET / POST / PUT / DELETE | `/api/turmas` | GET: todos · demais: Admin | Turmas com série, turno e ano letivo |
| GET / POST | `/api/areas` | GET: todos · POST: Admin | Áreas do conhecimento |
| GET / POST / PUT / DELETE | `/api/disciplinas` | GET: todos · demais: Admin | Disciplinas com código e área |
| GET / POST / PUT / DELETE | `/api/tags` | GET: todos · demais: Admin | Tags dos acompanhamentos |
| GET / PUT | `/api/bimestres` | GET: todos · PUT: Admin | Períodos bimestrais (filtro `?anoLetivo=`) |
| GET / POST / DELETE | `/api/vinculos` | GET: Admin e Professor · demais: Admin | Vínculos turma × disciplina × professor |
| GET | `/api/auditoria` | Admin | Histórico de alterações dos acompanhamentos |

Exclusões de registros que ainda estão em uso (por exemplo, uma tag usada em acompanhamentos) retornam **409**.

## 🧪 Testando a API com o Postman

Os testes rodam no **ambiente local**, com as senhas que você mesmo define no `.env` (nenhuma senha fica no repositório).

1. Siga a seção **Configuração para Desenvolvimento** até o backend estar no ar (`npm run dev`), incluindo o `criarAdmin.js` e a carga de demonstração.
2. No Postman, clique em **Import** e importe os dois arquivos da pasta `documentos/Entrega 2/Desenvolvimento Web Fullstack`:
   - `ClassSync API.postman_collection_final.json` — as rotas e os testes automáticos
   - `ClassSync.postman_environment.json` — as variáveis
3. No canto superior direito, selecione o environment **ClassSync** e preencha `senhaAdmin`, `senhaProfessor` e `senhaResponsavel` com as mesmas senhas do `.env` (`ADMIN_SENHA`, `DEMO_SENHA_PROFESSOR` e `DEMO_SENHA_RESPONSAVEL`).
4. Clique com o botão direito na coleção → **Run collection** → **Run**.

A coleção tem **56 requisições** em 5 pastas (Auth, Catálogo, Aluno, Acompanhamento e Ciência) e **115 verificações automáticas**: o status esperado está no nome de cada requisição e é conferido por um script da coleção. Ela faz login com os três perfis, testa as regras de cada rota, cria registros de teste e os apaga ao final. Pode ser executada várias vezes seguidas; se algum teste indicar falta de dados, basta rodar a carga de demonstração de novo.

O passo a passo, a tabela com todos os casos de teste e os prints da execução estão em `documentos/Entrega 2/Desenvolvimento Web Fullstack/ClassSync - Documentacao dos testes da API (Postman)`.

## 🚀 Deploy

| Serviço | Plataforma | Variáveis configuradas no painel |
| --- | --- | --- |
| Backend | Render (Root Directory: `src/Entrega 2/Backend`, start: `npm start`) | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL_CA`, `JWT_SECRET`, `FRONTEND_URL`, `BREVO_API_KEY`, `EMAIL_REMETENTE`, `EMAIL_REMETENTE_NOME` |
| Frontend | Vercel (Vite, rotas configuradas no `vercel.json`) | `VITE_API_URL` |
| Banco | Aiven (MySQL, conexão com SSL) | — |

O endereço oficial do frontend é `classsync-escolar.vercel.app`; o antigo `classsync-snowy.vercel.app` redireciona para ele. O `FRONTEND_URL` do Render lista os dois, separados por vírgula; o primeiro é usado no link dos e-mails de recuperação de senha.

**Atualizar a versão publicada após um merge na `main`:**
- **Backend:** painel do Render → serviço `classsync-api` → **Manual Deploy → Deploy latest commit**.
- **Frontend:** na pasta `src/Entrega 2/Frontend`, rodar `npx vercel --prod`.

## 🔭 Próximos passos

Funcionalidades previstas no protótipo que ficam para as próximas etapas:
- Primeiro acesso por convite: o usuário recebe um link e cria a própria senha, sem que o administrador a conheça.
- Vínculo entre responsável e aluno pela tela do administrador (hoje é feito no banco).
- Edição e desativação de usuários pelo administrador.
- Envio real das mensagens do formulário de Contato (hoje a tela só valida e confirma).

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

Bibliotecas principais: React Router, Axios, Lucide (ícones), Express, mysql2, bcrypt, jsonwebtoken, dotenv e cors. Serviço de e-mail: Brevo (API HTTP).

## 📋 Licença/License
<a href="https://github.com/2026-2-NADS2/Projeto17">ClassSync</a> © 2026 by <a href="https://github.com/matheusggdev">Matheus Gajewski de Melo</a>, <a href="https://github.com/melolivaa">Mel Oliva Motta</a> e <a href="https://github.com/Raynafroes">Rayna Guimarães Froes</a> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
<br>
<img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;"><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;">

## 🎓 Referências

Aqui estão as referências usadas no projeto.

1. REACT. **Documentação oficial do React**. Disponível em: <https://react.dev/>.
2. EXPRESS. **Documentação oficial do Express (Node.js)**. Disponível em: <https://expressjs.com/>.
3. ORACLE. **MySQL 8.0 Reference Manual**. Disponível em: <https://dev.mysql.com/doc/refman/8.0/en/>.
4. JONES, M.; BRADLEY, J.; SAKIMURA, N. **RFC 7519: JSON Web Token (JWT)**. IETF, 2015. Disponível em: <https://datatracker.ietf.org/doc/html/rfc7519>.
5. OWASP. **Password Storage Cheat Sheet**. Disponível em: <https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html>.
6. BRASIL. **Lei nº 13.709, de 14 de agosto de 2018: Lei Geral de Proteção de Dados Pessoais (LGPD)**. Disponível em: <https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm>.
