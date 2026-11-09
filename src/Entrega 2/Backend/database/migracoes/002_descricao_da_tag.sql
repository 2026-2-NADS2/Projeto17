-- Migração 002: descrição da tag (orienta o professor sobre quando usar)
ALTER TABLE tag
    ADD COLUMN descricao VARCHAR(200) NULL AFTER nome;