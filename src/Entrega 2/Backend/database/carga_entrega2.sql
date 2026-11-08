-- =====================================================================
-- ClassSync - Carga de dados da Entrega 2
-- NAO apaga o banco. Pode ser executado mais de uma vez (idempotente).
-- Usuarios NAO entram aqui: a senha precisa de hash bcrypt (cadastrar pelo sistema).
-- =====================================================================
USE classsync;
SET NAMES utf8mb4;

-- 1) Ajuste da coluna (ela ja existe como VARCHAR(255); passa para TEXT)
ALTER TABLE acompanhamento MODIFY COLUMN motivo_devolucao TEXT NULL;

-- 2) Ano letivo 2026
INSERT IGNORE INTO ano_letivo (ano, nota_minima, nota_maxima) VALUES (2026, 0, 10);

-- 3) Os 4 bimestres (o 4o esta aberto: 01/10/2026 a 30/11/2026)
INSERT IGNORE INTO bimestre (id_ano_letivo, numero, dt_abertura, dt_encerramento)
SELECT an.id_ano_letivo, v.numero, v.abertura, v.encerramento
FROM ano_letivo an
JOIN (
    SELECT 1 AS numero, '2026-02-02 00:00:00' AS abertura, '2026-04-15 23:59:59' AS encerramento
    UNION ALL SELECT 2, '2026-04-16 00:00:00', '2026-06-30 23:59:59'
    UNION ALL SELECT 3, '2026-07-01 00:00:00', '2026-09-30 23:59:59'
    UNION ALL SELECT 4, '2026-10-01 00:00:00', '2026-11-30 23:59:59'
) v
WHERE an.ano = 2026;

-- 4) Areas
INSERT IGNORE INTO area (nome) VALUES
    ('Linguagens'),
    ('Matemática'),
    ('Ciências da Natureza'),
    ('Ciências Humanas');

-- 5) Disciplinas
INSERT IGNORE INTO disciplina (id_area, nome, codigo)
SELECT ar.id_area, v.nome, v.codigo
FROM area ar
JOIN (
    SELECT 'Linguagens' AS area, 'Língua Portuguesa' AS nome, 'LP' AS codigo
    UNION ALL SELECT 'Linguagens', 'Inglês', 'ING'
    UNION ALL SELECT 'Matemática', 'Matemática', 'MAT'
    UNION ALL SELECT 'Ciências da Natureza', 'Ciências', 'CIE'
    UNION ALL SELECT 'Ciências Humanas', 'História', 'HIS'
    UNION ALL SELECT 'Ciências Humanas', 'Geografia', 'GEO'
) v ON v.area = ar.nome;

-- 6) Turmas (ano letivo 2026)
INSERT IGNORE INTO turma (id_ano_letivo, nome, serie, turno)
SELECT an.id_ano_letivo, v.nome, v.serie, v.turno
FROM ano_letivo an
JOIN (
    SELECT '6º Ano A' AS nome, '6º ano' AS serie, 'MANHA' AS turno
    UNION ALL SELECT '6º Ano B', '6º ano', 'MANHA'
    UNION ALL SELECT '7º Ano A', '7º ano', 'TARDE'
) v
WHERE an.ano = 2026;

-- 7) Alunos (so insere se o aluno ainda nao existir na turma)
INSERT INTO aluno (nome, data_nascimento, id_turma)
SELECT v.nome, v.nascimento, t.id_turma
FROM (
    SELECT 'Ana Beatriz Souza' AS nome, '2014-03-12' AS nascimento, '6º Ano A' AS turma
    UNION ALL SELECT 'Bruno Henrique Lima', '2014-07-25', '6º Ano A'
    UNION ALL SELECT 'Camila Ferreira',     '2014-11-02', '6º Ano A'
    UNION ALL SELECT 'Diego Martins',       '2014-01-18', '6º Ano B'
    UNION ALL SELECT 'Eduarda Alves',       '2014-05-30', '6º Ano B'
    UNION ALL SELECT 'Felipe Costa',        '2013-09-09', '7º Ano A'
    UNION ALL SELECT 'Gabriela Rocha',      '2013-12-21', '7º Ano A'
    UNION ALL SELECT 'Heitor Mendes',       '2013-04-14', '7º Ano A'
) v
JOIN ano_letivo an ON an.ano = 2026
JOIN turma t ON t.nome = v.turma AND t.id_ano_letivo = an.id_ano_letivo
WHERE NOT EXISTS (
    SELECT 1 FROM aluno a WHERE a.nome = v.nome AND a.id_turma = t.id_turma
);

-- 8) Tags
INSERT IGNORE INTO tag (nome) VALUES
    ('Participativo'),
    ('Organizado'),
    ('Precisa de reforço'),
    ('Faltas frequentes'),
    ('Destaque');

-- =====================================================================
-- BLOCO COMENTADO: vinculos (rodar DEPOIS de cadastrar os usuarios no sistema)
--
-- Passo A: descubra os IDs reais e anote:
--   SELECT id_usuario, nome, perfil FROM usuario;
--   SELECT id_turma, nome FROM turma;
--   SELECT id_disciplina, nome FROM disciplina;
--   SELECT id_aluno, nome FROM aluno;
--
-- Passo B: troque os IDs, tire o "-- " das linhas e execute.
--
-- Professor x Disciplina x Turma
--   (so pode haver UM professor por turma + disciplina)
-- INSERT INTO vinculo_docente (id_turma, id_disciplina, id_professor) VALUES
--     (1, 1, 2),   -- id_turma, id_disciplina, id_professor  <-- TROCAR OS IDs
--     (1, 3, 2),   -- <-- TROCAR OS IDs
--     (2, 1, 2);   -- <-- TROCAR OS IDs
--
-- Responsavel x Aluno
-- INSERT INTO responsavel_aluno (id_responsavel, id_aluno, parentesco) VALUES
--     (3, 1, 'Mãe'),   -- id_responsavel (usuario RESPONSAVEL), id_aluno <-- TROCAR OS IDs
--     (3, 2, 'Mãe');   -- <-- TROCAR OS IDs
-- =====================================================================
