DROP DATABASE IF EXISTS classsync;

CREATE DATABASE classsync
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE classsync;

-- Usuario unico por pessoa; o perfil define o acesso (Admin/Professor/Responsavel)
CREATE TABLE usuario (
    id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome       VARCHAR(120) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil     ENUM('ADMIN','PROFESSOR','RESPONSAVEL') NOT NULL,
    ativo      BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE ano_letivo (
    id_ano_letivo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ano           SMALLINT UNSIGNED NOT NULL UNIQUE,
    nota_minima   DECIMAL(5,2) NOT NULL DEFAULT 0,
    nota_maxima   DECIMAL(5,2) NOT NULL DEFAULT 10
) ENGINE=InnoDB;

CREATE TABLE bimestre (
    id_bimestre     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_ano_letivo   INT UNSIGNED NOT NULL,
    numero          TINYINT UNSIGNED NOT NULL,
    dt_abertura     DATETIME NOT NULL,
    dt_encerramento DATETIME NOT NULL,
    UNIQUE (id_ano_letivo, numero),
    CHECK (numero BETWEEN 1 AND 4),
    FOREIGN KEY (id_ano_letivo) REFERENCES ano_letivo (id_ano_letivo)
) ENGINE=InnoDB;

CREATE TABLE area (
    id_area INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome    VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE disciplina (
    id_disciplina INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_area       INT UNSIGNED NOT NULL,
    nome          VARCHAR(80) NOT NULL UNIQUE,
    FOREIGN KEY (id_area) REFERENCES area (id_area)
) ENGINE=InnoDB;

CREATE TABLE turma (
    id_turma      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_ano_letivo INT UNSIGNED NOT NULL,
    nome          VARCHAR(40) NOT NULL,
    serie         VARCHAR(20) NOT NULL,
    UNIQUE (id_ano_letivo, nome),
    FOREIGN KEY (id_ano_letivo) REFERENCES ano_letivo (id_ano_letivo)
) ENGINE=InnoDB;

CREATE TABLE aluno (
    id_aluno        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(120) NOT NULL,
    data_nascimento DATE NOT NULL,
    id_turma        INT UNSIGNED NOT NULL,
    FOREIGN KEY (id_turma) REFERENCES turma (id_turma)
) ENGINE=InnoDB;

-- N:N -- um responsavel pode ter varios alunos e um aluno pode ter varios responsaveis
CREATE TABLE responsavel_aluno (
    id_responsavel INT UNSIGNED NOT NULL,
    id_aluno       INT UNSIGNED NOT NULL,
    parentesco     VARCHAR(30),
    PRIMARY KEY (id_responsavel, id_aluno),
    FOREIGN KEY (id_responsavel) REFERENCES usuario (id_usuario),
    FOREIGN KEY (id_aluno) REFERENCES aluno (id_aluno)
) ENGINE=InnoDB;

-- Professor x Disciplina x Turma; UNIQUE impede vinculo duplicado.
CREATE TABLE vinculo_docente (
    id_vinculo    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_turma      INT UNSIGNED NOT NULL,
    id_disciplina INT UNSIGNED NOT NULL,
    id_professor  INT UNSIGNED NOT NULL,
    UNIQUE (id_turma, id_disciplina),
    FOREIGN KEY (id_turma) REFERENCES turma (id_turma),
    FOREIGN KEY (id_disciplina) REFERENCES disciplina (id_disciplina),
    FOREIGN KEY (id_professor) REFERENCES usuario (id_usuario)
) ENGINE=InnoDB;

CREATE TABLE tag (
    id_tag INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome   VARCHAR(60) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Nucleo do sistema: um registro por aluno + disciplina + bimestre
CREATE TABLE acompanhamento (
    id_acompanhamento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_aluno      INT UNSIGNED NOT NULL,
    id_disciplina INT UNSIGNED NOT NULL,
    id_professor  INT UNSIGNED NOT NULL,
    id_bimestre   INT UNSIGNED NOT NULL,
    media         DECIMAL(5,2),
    descricao     TEXT,
    status        ENUM('RASCUNHO','ENVIADO','EM_REVISAO','PUBLICADO',
                        'DEVOLVIDO','CANCELADO') NOT NULL DEFAULT 'RASCUNHO',
    id_revisor    INT UNSIGNED,
    publicado_em  DATETIME,
    UNIQUE (id_aluno, id_disciplina, id_bimestre),
    FOREIGN KEY (id_aluno) REFERENCES aluno (id_aluno),
    FOREIGN KEY (id_disciplina) REFERENCES disciplina (id_disciplina),
    FOREIGN KEY (id_professor) REFERENCES usuario (id_usuario),
    FOREIGN KEY (id_bimestre) REFERENCES bimestre (id_bimestre),
    FOREIGN KEY (id_revisor) REFERENCES usuario (id_usuario)
) ENGINE=InnoDB;

CREATE TABLE acompanhamento_tag (
    id_acompanhamento INT UNSIGNED NOT NULL,
    id_tag            INT UNSIGNED NOT NULL,
    PRIMARY KEY (id_acompanhamento, id_tag),
    FOREIGN KEY (id_acompanhamento) REFERENCES acompanhamento (id_acompanhamento),
    FOREIGN KEY (id_tag) REFERENCES tag (id_tag)
) ENGINE=InnoDB;

-- Auditoria: usuario, data/hora, estado anterior e posterior
CREATE TABLE acompanhamento_historico (
    id_historico      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_acompanhamento INT UNSIGNED NOT NULL,
    id_usuario        INT UNSIGNED,
    status_anterior   VARCHAR(20),
    status_novo       VARCHAR(20) NOT NULL,
    data_hora         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_acompanhamento) REFERENCES acompanhamento (id_acompanhamento),
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
) ENGINE=InnoDB;

-- Ciencia e retorno do responsavel
CREATE TABLE ciencia_responsavel (
    id_acompanhamento INT UNSIGNED NOT NULL,
    id_responsavel    INT UNSIGNED NOT NULL,
    observacao        TEXT,
    data_hora         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_acompanhamento, id_responsavel),
    FOREIGN KEY (id_acompanhamento) REFERENCES acompanhamento (id_acompanhamento),
    FOREIGN KEY (id_responsavel) REFERENCES usuario (id_usuario)
) ENGINE=InnoDB;

-- Indices para otimizar as consultas do sistema:
-- Relatorios gerenciais filtram os bimestres e os status
CREATE INDEX ix_acomp_bim_status ON acompanhamento (id_bimestre, status);
-- Tela do professor: "meus acompanhamentos" por bimestre
CREATE INDEX ix_acomp_professor ON acompanhamento (id_professor, id_bimestre);
-- Tela do responsavel: so registros PUBLICADOS de um aluno
CREATE INDEX ix_acomp_status_aluno ON acompanhamento (status, id_aluno);
-- Busca de alunos por nome nas telas de cadastro/consulta
CREATE INDEX ix_aluno_nome ON aluno (nome);

-- View: Consulta dos acompanhamentos publicados
CREATE OR REPLACE VIEW vw_acompanhamento_publicado AS
SELECT a.id_acompanhamento, al.nome AS aluno, t.nome AS turma,
       d.nome AS disciplina, u.nome AS professor, b.numero AS bimestre,
       ano.ano AS ano_letivo, a.media, a.descricao, a.publicado_em,
       GROUP_CONCAT(tg.nome SEPARATOR ', ') AS tags
FROM acompanhamento a
JOIN aluno al       ON al.id_aluno = a.id_aluno
JOIN turma t        ON t.id_turma = al.id_turma
JOIN disciplina d   ON d.id_disciplina = a.id_disciplina
JOIN usuario u      ON u.id_usuario = a.id_professor
JOIN bimestre b     ON b.id_bimestre = a.id_bimestre
JOIN ano_letivo ano ON ano.id_ano_letivo = b.id_ano_letivo
LEFT JOIN acompanhamento_tag at ON at.id_acompanhamento = a.id_acompanhamento
LEFT JOIN tag tg ON tg.id_tag = at.id_tag
WHERE a.status = 'PUBLICADO'
GROUP BY a.id_acompanhamento, al.nome, t.nome, d.nome, u.nome,
         b.numero, ano.ano, a.media, a.descricao, a.publicado_em;
