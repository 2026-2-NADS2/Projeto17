/**
 * Carga de dados de demonstração do ClassSync.
 *
 * Apaga TODOS os dados do banco, menos o administrador (ADMIN_EMAIL),
 * e insere uma escola fictícia completa: ano letivo, bimestres, turmas,
 * disciplinas, tags, professores, alunos, responsáveis e acompanhamentos.
 *
 * As contas de demonstração usam as senhas definidas no .env:
 *   DEMO_SENHA_PROFESSOR   → professores
 *   DEMO_SENHA_RESPONSAVEL → responsáveis
 *
 * Uso:
 *   node src/scripts/cargaDemonstracao.js              → só mostra em qual banco vai rodar
 *   node src/scripts/cargaDemonstracao.js --confirmar  → apaga e recria os dados
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../config/database");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@classsync.com";
const SENHAS = {
  PROFESSOR: process.env.DEMO_SENHA_PROFESSOR,
  RESPONSAVEL: process.env.DEMO_SENHA_RESPONSAVEL,
};
const SENHA_VALIDA = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;

// ---------------------------------------------------------------------------
// Dados da escola fictícia
// (e-mails no domínio reservado ".test", que não pertence a ninguém)
// ---------------------------------------------------------------------------
const ANO = 2026;

const BIMESTRES = [
  { numero: 1, abertura: "2026-02-02 00:00:00", encerramento: "2026-04-24 23:59:59" },
  { numero: 2, abertura: "2026-05-04 00:00:00", encerramento: "2026-07-10 23:59:59" },
  { numero: 3, abertura: "2026-07-27 00:00:00", encerramento: "2026-10-02 23:59:59" },
  { numero: 4, abertura: "2026-10-13 00:00:00", encerramento: "2026-12-11 23:59:59" },
];

const AREAS = ["Linguagens", "Matemática", "Ciências da Natureza", "Ciências Humanas"];

const DISCIPLINAS = [
  { nome: "Língua Portuguesa", codigo: "POR", area: "Linguagens" },
  { nome: "Inglês", codigo: "ING", area: "Linguagens" },
  { nome: "Matemática", codigo: "MAT", area: "Matemática" },
  { nome: "Ciências", codigo: "CIE", area: "Ciências da Natureza" },
  { nome: "História", codigo: "HIS", area: "Ciências Humanas" },
  { nome: "Geografia", codigo: "GEO", area: "Ciências Humanas" },
];

const TURMAS = [
  { nome: "6º ano A", serie: "6º ano", turno: "MANHA" },
  { nome: "6º ano B", serie: "6º ano", turno: "TARDE" },
  { nome: "7º ano A", serie: "7º ano", turno: "MANHA" },
];

const TAGS = [
  { nome: "Participativo", descricao: "Participa ativamente das aulas e atividades." },
  { nome: "Entrega em dia", descricao: "Cumpre prazos de tarefas e trabalhos." },
  { nome: "Destaque", descricao: "Desempenho acima do esperado." },
  { nome: "Resolve problemas", descricao: "Aplica estratégias próprias para resolver problemas." },
  { nome: "Boa leitura", descricao: "Lê com fluência e boa compreensão." },
  { nome: "Colabora com os colegas", descricao: "Ajuda e trabalha bem em grupo." },
  { nome: "Precisa de reforço", descricao: "Necessita de apoio adicional no conteúdo." },
  { nome: "Dificuldade de concentração", descricao: "Dispersa-se com frequência." },
];

const PROFESSORES = [
  { nome: "Ricardo Lima", email: "ricardo.lima@escola.test", disciplinas: ["Matemática", "Ciências"] },
  { nome: "Juliana Rocha", email: "juliana.rocha@escola.test", disciplinas: ["Língua Portuguesa", "Inglês"] },
  { nome: "Marcos Andrade", email: "marcos.andrade@escola.test", disciplinas: ["História", "Geografia"] },
];

// nivel define a faixa da média, o texto e as tags dos acompanhamentos
const ALUNOS = [
  { nome: "Ana Beatriz Costa", nascimento: "2015-03-14", turma: "6º ano A", nivel: "alto" },
  { nome: "Gabriel Santos", nascimento: "2015-07-22", turma: "6º ano A", nivel: "medio" },
  { nome: "Larissa Rocha", nascimento: "2015-01-09", turma: "6º ano A", nivel: "medio" },
  { nome: "Lucas Ferreira", nascimento: "2014-11-30", turma: "6º ano A", nivel: "baixo" },
  { nome: "Maria Souza", nascimento: "2015-05-18", turma: "6º ano A", nivel: "alto" },
  { nome: "Pedro Henrique Alves", nascimento: "2015-09-03", turma: "6º ano A", nivel: "medio" },
  { nome: "Beatriz Oliveira", nascimento: "2015-02-25", turma: "6º ano B", nivel: "alto" },
  { nome: "Davi Nascimento", nascimento: "2015-08-11", turma: "6º ano B", nivel: "medio" },
  { nome: "Helena Martins", nascimento: "2015-04-06", turma: "6º ano B", nivel: "medio" },
  { nome: "João Silva", nascimento: "2014-12-15", turma: "6º ano B", nivel: "baixo" },
  { nome: "Sofia Carvalho", nascimento: "2015-06-27", turma: "6º ano B", nivel: "alto" },
  { nome: "Rafael Moreira", nascimento: "2014-03-19", turma: "7º ano A", nivel: "medio" },
  { nome: "Isabela Ribeiro", nascimento: "2014-10-02", turma: "7º ano A", nivel: "alto" },
  { nome: "Miguel Araújo", nascimento: "2014-05-28", turma: "7º ano A", nivel: "baixo" },
  { nome: "Laura Mendes", nascimento: "2014-01-17", turma: "7º ano A", nivel: "medio" },
  { nome: "Enzo Barbosa", nascimento: "2014-08-08", turma: "7º ano A", nivel: "medio" },
  { nome: "Theo Souza", nascimento: "2013-12-04", turma: "7º ano A", nivel: "alto" },
];

const RESPONSAVEIS = [
  { nome: "Carla Souza", email: "carla.souza@familia.test", filhos: [["Maria Souza", "Mãe"], ["Theo Souza", "Mãe"]] },
  { nome: "Paulo Costa", email: "paulo.costa@familia.test", filhos: [["Ana Beatriz Costa", "Pai"]] },
  { nome: "Fernanda Silva", email: "fernanda.silva@familia.test", filhos: [["João Silva", "Mãe"]] },
  { nome: "Roberto Ferreira", email: "roberto.ferreira@familia.test", filhos: [["Lucas Ferreira", "Pai"]] },
  { nome: "Patrícia Santos", email: "patricia.santos@familia.test", filhos: [["Gabriel Santos", "Mãe"]] },
  { nome: "Cláudia Oliveira", email: "claudia.oliveira@familia.test", filhos: [["Beatriz Oliveira", "Mãe"]] },
  { nome: "Simone Moreira", email: "simone.moreira@familia.test", filhos: [["Rafael Moreira", "Mãe"]] },
  { nome: "André Ribeiro", email: "andre.ribeiro@familia.test", filhos: [["Isabela Ribeiro", "Pai"]] },
];

const FAIXAS_MEDIA = { alto: [8, 10], medio: [6.5, 8], baixo: [4.5, 6.5] };

const FRASES = {
  alto: [
    "Excelente desempenho em {d}, com participação ativa nas aulas e atividades entregues com capricho.",
    "Demonstra domínio dos conteúdos de {d} e ajuda os colegas nas atividades em grupo.",
    "Evolução consistente em {d}; resolve as propostas com autonomia e boa argumentação.",
  ],
  medio: [
    "Bom desempenho em {d}. Participa das aulas e pode aprofundar os estudos nos conteúdos mais recentes.",
    "Acompanha bem os conteúdos de {d}, com algumas dúvidas pontuais que vêm sendo trabalhadas em sala.",
    "Mostrou progresso em {d} ao longo do bimestre; precisa manter a regularidade nas tarefas de casa.",
  ],
  baixo: [
    "Apresenta dificuldades em {d}. Recomenda-se reforço nos conteúdos básicos e acompanhamento das tarefas em casa.",
    "Precisa de mais atenção às explicações em {d}; tem melhorado quando recebe apoio individual.",
    "Ainda não atingiu os objetivos do bimestre em {d}. Vamos reforçar os exercícios e acompanhar de perto.",
  ],
};

const TAGS_POR_NIVEL = {
  alto: ["Participativo", "Destaque", "Resolve problemas", "Entrega em dia", "Colabora com os colegas", "Boa leitura"],
  medio: ["Entrega em dia", "Participativo", "Boa leitura", "Colabora com os colegas"],
  baixo: ["Precisa de reforço", "Dificuldade de concentração"],
};

// Disciplinas com acompanhamentos publicados nos bimestres já encerrados
const DISCIPLINAS_COM_HISTORICO = ["Matemática", "Língua Portuguesa", "Ciências"];

// Situação do 4º bimestre (aberto): o que a demonstração vai mostrar
const QUARTO_BIMESTRE = [
  // Prof. Ricardo — Matemática, 6º ano A: um de cada situação
  { aluno: "Ana Beatriz Costa", disciplina: "Matemática", status: "ENVIADO" },
  { aluno: "Gabriel Santos", disciplina: "Matemática", status: "ENVIADO" },
  { aluno: "Larissa Rocha", disciplina: "Matemática", status: "RASCUNHO" },
  { aluno: "Lucas Ferreira", disciplina: "Matemática", status: "ENVIADO" },
  {
    aluno: "Maria Souza",
    disciplina: "Matemática",
    status: "DEVOLVIDO",
    motivo: "Revisar a média: está diferente das avaliações lançadas no diário. Confirme o valor e reenvie.",
  },
  // (Pedro Henrique Alves ainda sem registro de Matemática: aparece como pendente)
  // Prof. Ricardo — Ciências, 6º ano A
  { aluno: "Ana Beatriz Costa", disciplina: "Ciências", status: "RASCUNHO" },
  { aluno: "Maria Souza", disciplina: "Ciências", status: "PUBLICADO" },
  // Prof.ª Juliana — Língua Portuguesa, 6º ano A
  { aluno: "Ana Beatriz Costa", disciplina: "Língua Portuguesa", status: "ENVIADO" },
  { aluno: "Gabriel Santos", disciplina: "Língua Portuguesa", status: "ENVIADO" },
  { aluno: "Larissa Rocha", disciplina: "Língua Portuguesa", status: "ENVIADO" },
  { aluno: "Lucas Ferreira", disciplina: "Língua Portuguesa", status: "ENVIADO" },
  { aluno: "Maria Souza", disciplina: "Língua Portuguesa", status: "PUBLICADO" },
  { aluno: "Pedro Henrique Alves", disciplina: "Língua Portuguesa", status: "ENVIADO" },
  // Prof. Ricardo — Matemática, 6º ano B
  { aluno: "Beatriz Oliveira", disciplina: "Matemática", status: "ENVIADO" },
  { aluno: "Davi Nascimento", disciplina: "Matemática", status: "RASCUNHO" },
  // Prof. Marcos — História, 7º ano A
  { aluno: "Rafael Moreira", disciplina: "História", status: "ENVIADO" },
  { aluno: "Isabela Ribeiro", disciplina: "História", status: "ENVIADO" },
  { aluno: "Theo Souza", disciplina: "História", status: "PUBLICADO" },
];

// Ciências (leituras) já registradas pelos responsáveis
const CIENCIAS = [
  { responsavel: "carla.souza@familia.test", aluno: "Maria Souza", disciplina: "Matemática", bimestre: 1, observacao: null },
  { responsavel: "carla.souza@familia.test", aluno: "Maria Souza", disciplina: "Matemática", bimestre: 2, observacao: "Obrigada pelo retorno! Vamos continuar incentivando em casa." },
  { responsavel: "paulo.costa@familia.test", aluno: "Ana Beatriz Costa", disciplina: "Língua Portuguesa", bimestre: 3, observacao: "Ela tem lido bastante em casa. Podemos conversar sobre indicações de livros?" },
];

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

// Gerador pseudoaleatório com semente fixa: a carga sai sempre igual
let semente = 2026;
function aleatorio() {
  semente = (semente * 1103515245 + 12345) % 2147483648;
  return semente / 2147483648;
}
function sortear(lista) {
  return lista[Math.floor(aleatorio() * lista.length)];
}
function mediaDaFaixa([min, max]) {
  return Math.round((min + aleatorio() * (max - min)) * 2) / 2; // de 0,5 em 0,5
}
function sortearTags(nivel) {
  const opcoes = [...TAGS_POR_NIVEL[nivel]];
  const quantidade = 1 + Math.floor(aleatorio() * 2); // 1 ou 2 tags
  const escolhidas = [];
  for (let i = 0; i < quantidade && opcoes.length > 0; i++) {
    escolhidas.push(opcoes.splice(Math.floor(aleatorio() * opcoes.length), 1)[0]);
  }
  return escolhidas;
}
function descricao(nivel, disciplina) {
  return sortear(FRASES[nivel]).replace("{d}", disciplina.toLowerCase());
}

// Date → "AAAA-MM-DD HH:MM:SS"
function formatar(data) {
  const p = (n) => String(n).padStart(2, "0");
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())} ` +
         `${p(data.getHours())}:${p(data.getMinutes())}:${p(data.getSeconds())}`;
}
function somarDias(base, dias, hora = 10) {
  const data = new Date(base);
  data.setDate(data.getDate() + dias);
  data.setHours(hora, Math.floor(aleatorio() * 60), 0, 0);
  return data;
}

// ---------------------------------------------------------------------------
// Etapas da carga
// ---------------------------------------------------------------------------

async function limparBanco(conexao, idAdmin) {
  const tabelas = [
    "acompanhamento_tag", "acompanhamento_historico", "ciencia_responsavel", "acompanhamento",
    "responsavel_aluno", "vinculo_docente", "aluno", "turma", "disciplina", "area",
    "tag", "bimestre", "ano_letivo",
  ];
  await conexao.query("SET FOREIGN_KEY_CHECKS = 0");
  try {
    for (const tabela of tabelas) {
      await conexao.query(`TRUNCATE TABLE ${tabela}`);
    }
    await conexao.query("DELETE FROM usuario WHERE id_usuario <> ?", [idAdmin]);
    await conexao.query("ALTER TABLE usuario AUTO_INCREMENT = 1"); // volta para o maior id + 1
  } finally {
    await conexao.query("SET FOREIGN_KEY_CHECKS = 1");
  }
}

async function inserirEstrutura(conexao) {
  const ids = { bimestres: {}, areas: {}, disciplinas: {}, turmas: {}, tags: {} };

  const [ano] = await conexao.query(
    "INSERT INTO ano_letivo (ano, nota_minima, nota_maxima) VALUES (?, 0, 10)", [ANO]
  );
  ids.anoLetivo = ano.insertId;

  for (const b of BIMESTRES) {
    const [r] = await conexao.query(
      "INSERT INTO bimestre (id_ano_letivo, numero, dt_abertura, dt_encerramento) VALUES (?, ?, ?, ?)",
      [ids.anoLetivo, b.numero, b.abertura, b.encerramento]
    );
    ids.bimestres[b.numero] = { id: r.insertId, ...b };
  }
  for (const nome of AREAS) {
    const [r] = await conexao.query("INSERT INTO area (nome) VALUES (?)", [nome]);
    ids.areas[nome] = r.insertId;
  }
  for (const d of DISCIPLINAS) {
    const [r] = await conexao.query(
      "INSERT INTO disciplina (id_area, nome, codigo) VALUES (?, ?, ?)",
      [ids.areas[d.area], d.nome, d.codigo]
    );
    ids.disciplinas[d.nome] = r.insertId;
  }
  for (const t of TURMAS) {
    const [r] = await conexao.query(
      "INSERT INTO turma (id_ano_letivo, nome, serie, turno) VALUES (?, ?, ?, ?)",
      [ids.anoLetivo, t.nome, t.serie, t.turno]
    );
    ids.turmas[t.nome] = r.insertId;
  }
  for (const tag of TAGS) {
    const [r] = await conexao.query("INSERT INTO tag (nome, descricao) VALUES (?, ?)", [tag.nome, tag.descricao]);
    ids.tags[tag.nome] = r.insertId;
  }
  return ids;
}

async function inserirPessoas(conexao, ids) {
  const pessoas = { professores: {}, professorDe: {}, alunos: {}, responsaveis: {} };

  async function criarUsuario(nome, email, perfil) {
    const hash = await bcrypt.hash(SENHAS[perfil], 10);
    const [r] = await conexao.query(
      "INSERT INTO usuario (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, ?, TRUE)",
      [nome, email, hash, perfil]
    );
    return r.insertId;
  }

  // Professores e vínculos: cada professor dá as suas disciplinas em todas as turmas
  for (const p of PROFESSORES) {
    const id = await criarUsuario(p.nome, p.email, "PROFESSOR");
    pessoas.professores[p.email] = id;
    for (const turma of TURMAS) {
      for (const disciplina of p.disciplinas) {
        await conexao.query(
          "INSERT INTO vinculo_docente (id_turma, id_disciplina, id_professor) VALUES (?, ?, ?)",
          [ids.turmas[turma.nome], ids.disciplinas[disciplina], id]
        );
        pessoas.professorDe[`${turma.nome}|${disciplina}`] = id;
      }
    }
  }

  for (const a of ALUNOS) {
    const [r] = await conexao.query(
      "INSERT INTO aluno (nome, data_nascimento, id_turma) VALUES (?, ?, ?)",
      [a.nome, a.nascimento, ids.turmas[a.turma]]
    );
    pessoas.alunos[a.nome] = { id: r.insertId, ...a };
  }

  for (const resp of RESPONSAVEIS) {
    const id = await criarUsuario(resp.nome, resp.email, "RESPONSAVEL");
    pessoas.responsaveis[resp.email] = id;
    for (const [nomeAluno, parentesco] of resp.filhos) {
      await conexao.query(
        "INSERT INTO responsavel_aluno (id_responsavel, id_aluno, parentesco) VALUES (?, ?, ?)",
        [id, pessoas.alunos[nomeAluno].id, parentesco]
      );
    }
  }
  return pessoas;
}

// Cria o acompanhamento passando pelo fluxo real (rascunho → enviado → final),
// para o histórico (triggers) registrar cada etapa; depois ajusta as datas.
async function criarAcompanhamento(conexao, ids, pessoas, idAdmin, dados) {
  const aluno = pessoas.alunos[dados.aluno];
  const bimestre = ids.bimestres[dados.bimestre];
  const idProfessor = pessoas.professorDe[`${aluno.turma}|${dados.disciplina}`];
  const rascunhoIncompleto = dados.status === "RASCUNHO" && aleatorio() < 0.5;

  const media = rascunhoIncompleto ? null : mediaDaFaixa(FAIXAS_MEDIA[aluno.nivel]);
  const texto = descricao(aluno.nivel, dados.disciplina);

  const [r] = await conexao.query(
    `INSERT INTO acompanhamento (id_aluno, id_disciplina, id_professor, id_bimestre, media, descricao, status)
     VALUES (?, ?, ?, ?, ?, ?, 'RASCUNHO')`,
    [aluno.id, ids.disciplinas[dados.disciplina], idProfessor, bimestre.id, media, texto]
  );
  const idAcomp = r.insertId;

  for (const nomeTag of sortearTags(aluno.nivel)) {
    await conexao.query(
      "INSERT INTO acompanhamento_tag (id_acompanhamento, id_tag) VALUES (?, ?)", [idAcomp, ids.tags[nomeTag]]
    );
  }

  // Datas das etapas: bimestres encerrados usam o fim do bimestre; o 4º usa a data de hoje
  const referencia = bimestre.numero === 4 ? new Date() : new Date(bimestre.encerramento);
  const datas = bimestre.numero === 4
    ? [somarDias(referencia, -12), somarDias(referencia, -5), somarDias(referencia, -2)]
    : [somarDias(referencia, -20), somarDias(referencia, -8), somarDias(referencia, 4)];

  if (dados.status !== "RASCUNHO") {
    await conexao.query("UPDATE acompanhamento SET status = 'ENVIADO' WHERE id_acompanhamento = ?", [idAcomp]);
  }
  if (dados.status === "PUBLICADO") {
    await conexao.query(
      "UPDATE acompanhamento SET status = 'PUBLICADO', id_revisor = ?, publicado_em = ? WHERE id_acompanhamento = ?",
      [idAdmin, formatar(datas[2]), idAcomp]
    );
  }
  if (dados.status === "DEVOLVIDO") {
    await conexao.query(
      "UPDATE acompanhamento SET status = 'DEVOLVIDO', id_revisor = ?, motivo_devolucao = ? WHERE id_acompanhamento = ?",
      [idAdmin, dados.motivo, idAcomp]
    );
  }

  // Ajusta as datas do histórico (se as triggers existirem no banco)
  const [historico] = await conexao.query(
    "SELECT id_historico FROM acompanhamento_historico WHERE id_acompanhamento = ? ORDER BY id_historico",
    [idAcomp]
  );
  for (let i = 0; i < historico.length; i++) {
    await conexao.query(
      "UPDATE acompanhamento_historico SET data_hora = ? WHERE id_historico = ?",
      [formatar(datas[Math.min(i, datas.length - 1)]), historico[i].id_historico]
    );
  }
  return idAcomp;
}

async function inserirAcompanhamentos(conexao, ids, pessoas, idAdmin) {
  const criados = {};
  const contagem = {};

  async function criar(dados) {
    const id = await criarAcompanhamento(conexao, ids, pessoas, idAdmin, dados);
    criados[`${dados.aluno}|${dados.disciplina}|${dados.bimestre}`] = id;
    contagem[dados.status] = (contagem[dados.status] || 0) + 1;
  }

  // Bimestres 1 a 3: tudo publicado (histórico para os responsáveis)
  for (const numero of [1, 2, 3]) {
    for (const aluno of ALUNOS) {
      for (const disciplina of DISCIPLINAS_COM_HISTORICO) {
        await criar({ aluno: aluno.nome, disciplina, bimestre: numero, status: "PUBLICADO" });
      }
    }
  }
  // 4º bimestre (aberto)
  for (const item of QUARTO_BIMESTRE) {
    await criar({ ...item, bimestre: 4 });
  }

  // Ciências dos responsáveis
  for (const c of CIENCIAS) {
    const idAcomp = criados[`${c.aluno}|${c.disciplina}|${c.bimestre}`];
    const data = somarDias(new Date(ids.bimestres[c.bimestre].encerramento), 6, 19);
    await conexao.query(
      `INSERT INTO ciencia_responsavel (id_acompanhamento, id_responsavel, observacao, data_hora)
       VALUES (?, ?, ?, ?)`,
      [idAcomp, pessoas.responsaveis[c.responsavel], c.observacao, formatar(data)]
    );
  }
  return contagem;
}

// ---------------------------------------------------------------------------
// Execução
// ---------------------------------------------------------------------------
async function main() {
  const destino = `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

  if (!process.argv.includes("--confirmar")) {
    console.log(`\nBanco de destino: ${destino}`);
    console.log("Esta carga APAGA todos os dados (menos o administrador) e insere dados fictícios.");
    console.log("Para executar, rode de novo com: --confirmar\n");
    await pool.end();
    return;
  }

  for (const [perfil, senha] of Object.entries(SENHAS)) {
    if (!senha || !SENHA_VALIDA.test(senha)) {
      throw new Error(`Defina DEMO_SENHA_${perfil} no .env (8 a 72 caracteres, com letras e números).`);
    }
  }
  if (SENHAS.PROFESSOR === SENHAS.RESPONSAVEL) {
    throw new Error("Use senhas diferentes para DEMO_SENHA_PROFESSOR e DEMO_SENHA_RESPONSAVEL.");
  }

  const conexao = await pool.getConnection();
  try {
    const [[admin]] = await conexao.query("SELECT id_usuario FROM usuario WHERE email = ?", [ADMIN_EMAIL]);
    if (!admin) {
      throw new Error(`Administrador ${ADMIN_EMAIL} não encontrado. Rode o criarAdmin.js antes.`);
    }

    console.log(`\nBanco de destino: ${destino}`);
    console.log("1/4 Apagando os dados (o administrador é mantido)...");
    await limparBanco(conexao, admin.id_usuario);

    console.log("2/4 Inserindo ano letivo, bimestres, turmas, disciplinas e tags...");
    const ids = await inserirEstrutura(conexao);

    console.log("3/4 Inserindo professores, alunos e responsáveis...");
    const pessoas = await inserirPessoas(conexao, ids);

    console.log("4/4 Inserindo acompanhamentos...");
    const contagem = await inserirAcompanhamentos(conexao, ids, pessoas, admin.id_usuario);

    console.log("\nCarga concluída!");
    console.log(`- ${ALUNOS.length} alunos, ${TURMAS.length} turmas, ${DISCIPLINAS.length} disciplinas, ${TAGS.length} tags`);
    console.log("- Acompanhamentos:", contagem);
    console.log("\nContas de demonstração:");
    console.log("  Professores (senha = DEMO_SENHA_PROFESSOR):");
    PROFESSORES.forEach((p) => console.log(`    ${p.email}`));
    console.log("  Responsáveis (senha = DEMO_SENHA_RESPONSAVEL):");
    RESPONSAVEIS.forEach((r) => console.log(`    ${r.email}`));
    console.log(`  Admin:       ${ADMIN_EMAIL} (senha não alterada)\n`);
  } finally {
    conexao.release();
    await pool.end();
  }
}

main().catch((erro) => {
  console.error("\nErro na carga:", erro.message);
  process.exit(1);
});
