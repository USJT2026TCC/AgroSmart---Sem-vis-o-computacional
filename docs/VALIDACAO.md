# Validação da versão climática

Verificações executadas localmente na preparação desta versão, em 15 de outubro de 2026. Nenhuma nova implantação Sepolia foi feita.

| Componente | Verificação | Resultado |
|---|---|---|
| Contratos Solidity | Hardhat | 89 testes aprovados |
| Contratos Solidity | solidity-coverage | 100% de instruções, ramos, funções e linhas |
| API | node:test com PostgreSQL/PostGIS em memória | 107 testes aprovados |
| Oráculo | node:test | 69 testes aprovados |
| Aplicativo | Vitest e Testing Library | 65 testes aprovados |
| Oráculo e blockchain | Nó Hardhat real e comandos do operador | 7 testes aprovados |
| API e blockchain | Indexação, pagamento, cancelamento, idempotência e retomada | 5 testes aprovados |
| Aplicativo | Build Vite | Aprovado |
| Demonstração climática | Emissão, garantia, publicação, liquidação e saldo do produtor | Aprovada, pagamento de 1 ETH de teste local |

O simulador climático foi preservado; sua suíte Python não foi executada nesta preparação. Não foi repetida análise Slither nesta versão. Cobertura e testes não substituem auditoria de segurança.

## Medição local de gas

Compilador Solidity 0.8.24, otimizador ativo com 200 runs. `npx hardhat run scripts/custo-por-apolice.js` recompila e mede operações do contrato desta versão.

| Operação | Gas medido |
|---|---:|
| Emissão pela fábrica | 1.401.937 |
| Depósito da garantia | 47.132 |
| Primeira publicação sem pagamento | 152.005 |
| Publicação seguinte com pagamento | 198.075 |

Na demonstração contínua, publicações posteriores sem pagamento têm custo diferente da primeira. A projeção do script usa o valor da primeira para todas as publicações sem acionamento, como simplificação conservadora nesse cenário medido.

Com 30 publicações até o pagamento, prêmio de 0,04104 ETH e preço hipotético de 0,5 gwei, a projeção é 7,3773% do prêmio. Não é medição de custo em rede principal ou L2. Não inclui implantação da infraestrutura compartilhada, falhas ou resgate.

As medições antigas com visão computacional não foram importadas e não devem ser citadas como resultados desta versão.
