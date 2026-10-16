# Arquitetura climática

A aplicação React usa a API para autenticação, cadastro, histórico e propostas. A carteira assina as operações financeiras diretamente. O backend valida assinaturas das fontes, guarda leituras no PostgreSQL/PostGIS e indexa eventos da blockchain.

O oráculo consulta leituras, valida plausibilidade e reputação, calcula o índice, registra a publicação numa fila persistente e envia a transação. A falha de envio preserva a entrada para novas tentativas. O registro de auditoria preserva também o array de leituras usado no cálculo.

O OracleRegistry controla quem publica. A ApoliceFactory cria uma ApolicePolicy por apólice. A Policy guarda os termos, exige garantia e avalia exclusivamente estiagem. A transferência segue verificações, efeitos e interação, com guarda de reentrância e reversão atômica.

## Interface em cadeia

- `publicarIndices(uint256 periodo, uint32 indiceClimatico, bytes32 hashLeituras)`
- `simularPercentual(uint32 indiceClimatico)`
- `publicacao(periodo)` retorna oráculo, índice climático, instante e hash das leituras.
- `IndicesPublicados` contém período, oráculo, índice climático e hash das leituras.

As ABIs em `app/src/cadeia/abis.js`, `backend/src/cadeia/abis.js` e `oraculo/src/abi.js` usam esse formato. Contratos antigos são incompatíveis.

## Evidências e confiança

O hash é SHA256 dos bytes UTF8 de `JSON.stringify(leituras)`, na ordem recebida. O mesmo array é retido em `payload.leituras` na fila e em `procedencia.leituras` nos relatos e registros. Alterar conteúdo ou ordem muda o hash. A cadeia não recupera as leituras pelo hash: é necessário preservar os arquivos, banco e versão do consolidador.

Esse compromisso detecta alteração posterior da evidência disponível; não prova que o sensor mediu corretamente. A reputação e a exigência de duas fontes na série são verificadas fora da cadeia.

## Estados

AGUARDANDO_GARANTIA passa a ATIVA após depósito exato. Antes da vigência, produtor ou seguradora podem cancelar. ATIVA passa a LIQUIDADA após pagamento único, ou ENCERRADA após resgate pela seguradora depois da vigência sem acionamento. Em LIQUIDADA, o saldo remanescente pode ser devolvido sem reabrir a cobertura.
