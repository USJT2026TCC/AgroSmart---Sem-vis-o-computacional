-- Cancelamento antes da vigencia.
-- ------------------------------------------------------------- cancelamento

-- O contrato ganhou a situacao CANCELADA (4).
ALTER TABLE apolices DROP CONSTRAINT apolices_situacao_check;
ALTER TABLE apolices ADD CONSTRAINT apolices_situacao_check CHECK (situacao BETWEEN 0 AND 4);

-- Data em que o produtor quer que a cobertura comece. Sem ela, a vigencia comeca
-- na emissao, e o cancelamento "antes da vigencia" nunca teria janela. Nula vale
-- o comportamento anterior.
ALTER TABLE propostas ADD COLUMN inicio_desejado date;
