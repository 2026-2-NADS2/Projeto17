# FECAP - Fundação Escola de Comércio Álvares Penteado

<p align="center">
  <a href= "https://www.fecap.br/"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhZPrRa89Kma0ZZogxm0pi-tCn_TLKeHGVxywp-LXAFGR3B1DPouAJYHgKZGV0XTEf4AE&usqp=CAU" alt="FECAP - Fundação de Comércio Álvares Penteado" border="0"></a>
</p>

# Projeto Interdisciplinar: Website Responsivo

## Nome do Grupo: **ClassSync**

## Integrantes: <a href="https://github.com/matheusggdev">Matheus Gajewski de Melo</a>, <a href="https://github.com/melolivaa">Mel Oliva Motta</a>, <a href="https://github.com/Raynafroes">Rayna Guimarães Froes</a>

## Professores Orientadores: <a href="https://www.linkedin.com/in/adriano-valente/">Adriano Valente</a>, <a href="https://www.linkedin.com/in/eduardo-savino/">Eduardo Savino</a>, <a href="https://www.linkedin.com/in/francisco-escobar/">Francisco Escobar</a>, <a href="https://www.linkedin.com/in/jbuesso/">José Buesso</a>, <a href="https://www.linkedin.com/in/ronaldo-araujo-pinto-3542811a/">Ronaldo Araújo</a>
 
## Status do Projeto: Em desenvolvimento 🚧

## Descrição

<p align="center">
<img src="imagens/Logo/BANNER - ClassSync.png" alt="BANNER-ClassSync" border="0">
</p>

O ClassSync é uma plataforma web responsiva desenvolvida para auxiliar escolas de ensino fundamental no acompanhamento do desempenho acadêmico dos alunos e na comunicação entre professores, escola e pais ou responsáveis. A plataforma centraliza os acompanhamentos bimestrais, permitindo que professores registrem médias, descrições e tags sobre o desempenho dos alunos, enquanto a administração gerencia os dados escolares e revisa os registros antes da publicação.
<br><br>
O sistema possui três perfis: Administrador, Professor e Pai/Responsável, cada um com permissões específicas. Após a revisão e publicação pelo administrador, os responsáveis podem consultar os acompanhamentos dos alunos vinculados e gerar relatórios em PDF. O sistema também conta com recursos administrativos, como relatórios e exportação de dados, oferecendo uma solução organizada e centralizada para o acompanhamento escolar.
<br><br>

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
|  &emsp; &emsp;|-->Venha para a FECAP!.txt<br>
|  &emsp;|-->Entrega 2<br>
|  &emsp; &emsp;|-->BD<br>
|  &emsp; &emsp;|-->Desenvolvimento Web Fullstack<br>
|  &emsp; &emsp;|-->Design de Interface Digital<br>
|  &emsp; &emsp;|-->Estrutura de Dados<br>
|  &emsp; &emsp;|-->POO<br>
|  &emsp; &emsp;|-->Venha para a FECAP!.txt<br>
|  &emsp;|-->Documento - Projeto de Extensão - COM Empresa - 2026_1.docx<br>
|  &emsp;|-->MODELO_BANNER_FECAP_2026_1.pptx<br>
|  &emsp;|-->README.md<br>
|  &emsp;|-->Venha para a FECAP!.txt<br>
|<br>
|-->imagens<br>
|  &emsp;|-->Logo<br>
|  &emsp; &emsp;|-->BANNER - ClassSync.png<br>
|<br>
|-->src<br>
|  &emsp;|-->Entrega 1<br>
|  &emsp; &emsp;|-->Backend<br>
|  &emsp; &emsp;&emsp;|-->src<br>
|  &emsp; &emsp;|-->Frontend<br>
|  &emsp; &emsp;&emsp;|-->public<br>
|  &emsp; &emsp;&emsp;|-->src<br>
|  &emsp; &emsp;&emsp;&emsp;|-->assets<br>
|  &emsp; &emsp;&emsp;&emsp;|-->components<br>
|  &emsp; &emsp;&emsp;&emsp;|-->pages<br>
|  &emsp;|-->Entrega 2<br>
|  &emsp; &emsp;|-->Backend<br>
|  &emsp; &emsp;|-->Frontend<br>
|<br>
|.gitignore<br>
|readme.md<br>

## 💻 Configuração para Desenvolvimento


### Pré-requisitos
- Node.js instalado (verifique com `node -v`)
- MySQL Server instalado e rodando (versão 8.0.x)
- Git instalado

### 1. Clonar o repositório

```bash
git clone https://github.com/2026-2-NADS2/Projeto17.git
cd Projeto17
```

### 2. Configurar o Backend

```bash
cd "src/Entrega 1/Backend"
npm install
```

Crie um arquivo `.env` dentro da pasta `Backend`, copiando o modelo de `.env.example`, com as seguintes variáveis:
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=classsync

### 3. Configurar o Banco de Dados

1. Abra o MySQL Workbench (ou outro cliente de sua preferência) e conecte usando as mesmas credenciais do `.env`.
2. Execute o script localizado em `Backend/database/schema.sql` para criar o banco `classsync`, suas tabelas, índices e views.

### 4. Rodar o Backend

Ainda dentro da pasta `Backend`:

```bash
npm run dev
```

O servidor deve iniciar em `http://localhost:3000`. Para testar, acesse `http://localhost:3000/api/teste` no navegador — deve aparecer a mensagem "ClassSync API funcionando!".

### 5. Configurar e rodar o Frontend

Em um novo terminal:

```bash
cd "src/Entrega 1/Frontend"
npm install
npm run dev
```

O frontend deve iniciar em `http://localhost:5173`. Acesse esse endereço no navegador para visualizar o sistema.

### Observações importantes

- O Backend e o Frontend precisam estar rodando **ao mesmo tempo**, em terminais separados, para o sistema funcionar por completo.
- Sem o MySQL configurado e rodando, as telas que consomem dados reais (como o Dashboard do Administrador e a Home do Responsável) vão exibir uma mensagem de erro de conexão — isso é esperado nesse cenário, mas a interface e a navegação continuam funcionando normalmente.
- Para testar o fluxo completo de login, use os botões de demonstração ("Entrar como Professor/Administrador/Responsável") na tela de Login, já que a autenticação real ainda não foi implementada nesta entrega.

## 🛠️ Tecnologias e Ferramentas Utilizadas

<div style="display: inline_block">
  <img align="center" alt="logo-html" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" />
  <img align="center" alt="logo-css" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" />
  <img align="center" alt="logo-js" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" />
  <img align="center" alt="logo-react" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" />
  <img align="center" alt="logo-node" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" />
  <img align="center" alt="logo-mysql" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg" />
  <img align="center" alt="logo-figma" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg" />
  <img align="center" alt="logo-vscode" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg" />
</div>

## 📋 Licença/License
<a href="https://github.com/2026-2-NADS2/Projeto17">ClassSync</a> © 2026 by <a href="https://github.com/matheusggdev">Matheus Gajewski de Melo, Mel Oliva Motta, Rayna Guimarães Froes</a> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a><img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;"><img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="max-width: 1em;max-height:1em;margin-left: .2em;">

## 🎓 Referências

Aqui estão as referências usadas no projeto.

1. <https://github.com/iuricode/readme-template>
2. <https://github.com/gabrieldejesus/readme-model>
3. <https://chooser-beta.creativecommons.org/>
4. <https://freesound.org/>
5. <https://www.toptal.com/developers/gitignore>
6. Músicas por: <a href="https://freesound.org/people/DaveJf/sounds/616544/"> DaveJf </a> e <a href="https://freesound.org/people/DRFX/sounds/338986/"> DRFX </a> ambas com Licença CC 0.
