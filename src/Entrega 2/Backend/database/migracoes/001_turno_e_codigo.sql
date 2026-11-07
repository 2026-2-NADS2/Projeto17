-- Migração 001: turno da turma e código da disciplina (usados nas telas de admin)
ALTER TABLE turma
    ADD COLUMN turno ENUM('MANHA','TARDE','NOITE') NOT NULL DEFAULT 'MANHA' AFTER serie;

ALTER TABLE disciplina
    ADD COLUMN codigo VARCHAR(10) NULL UNIQUE AFTER nome;