# Requisitos da versão climática

| ID local | Comportamento | Evidência de teste |
|---|---|---|
| C01 | Autenticar produtor e seguradora e aplicar perfis | backend/test/autenticacao.test.js e app/test/telas/autenticacao.test.jsx |
| C02 | Vincular carteira por assinatura, sem custodiar chave do produtor | backend/test/carteira.test.js |
| C03 | Cadastrar talhão e produto exclusivamente climático | backend/test/cadastro.test.js e escopo-climatico.test.js |
| C04 | Cotar e preparar emissão com termos imutáveis | backend/test/propostas.test.js e app/test/telas/cotacao.test.jsx |
| C05 | Exigir garantia exata e permitir cancelamento antes da vigência | contratos/test/ApolicePolicy.test.js e Cancelamento.test.js |
| C06 | Receber leituras assinadas e validar plausibilidade | backend/test/leituras.test.js |
| C07 | Consolidar clima com reputação e ao menos duas fontes válidas na série | oraculo/test/consolidador.test.js e escopo-climatico.test.js |
| C08 | Preservar índice e leituras na fila e registrar gas e transação | oraculo/test/fila.test.js, backend.test.js e escopo-climatico.test.js |
| C09 | Rejeitar oráculo não autorizado e período duplicado | contratos/test/ApolicePolicy.test.js |
| C10 | Pagar uma vez conforme o índice climático, com atomicidade e reentrância bloqueada | contratos/test/Seguranca.test.js e RegraDeGatilho.test.js |
| C11 | Exibir eventos, notificações, estado e relatórios | backend/integracao/indexador.test.js e app/test/telas/apolice.test.jsx |

## Fórmula

Abaixo do gatilho: percentual 0. Integral: percentual 10000 bps. No modo proporcional: `5000 + floor(5000 * (indice - gatilho) / (teto - gatilho))`, limitado a 10000 bps. O construtor exige teto maior que gatilho nesse modo. O valor em wei é `floor(limite * percentual / 10000)`.

A regra determina um pagamento único no primeiro acionamento. A vigência e o estado são verificados pelo contrato; não há retificação visual ou publicação complementar.

## Avaliação ainda necessária

Novas medições de gas e de custo por vigência; vazão e indisponibilidade prolongada; completude das leituras por dia; adequação e independência espacial das estações; calibração agronômica do limiar. A publicação depende de um oráculo autorizado e só é aceita durante a vigência atual do contrato.
