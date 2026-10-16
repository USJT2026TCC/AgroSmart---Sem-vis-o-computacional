# AgroSmart sem visão computacional

Protótipo de seguro agrícola paramétrico de estiagem com contratos inteligentes, sensores simulados e oráculo.

Esta versão deriva de [USJT2026TCC/SmartAgro](https://github.com/USJT2026TCC/SmartAgro), commit `6b28fe724a9624628dfb8526d5bf9aa2b2ec9474`. O desenvolvimento continua neste repositório separado. O projeto original é a referência histórica da versão com imagens.

Ana Victória Faria dos Santos · Beatriz Aarão de Melo · Bruno Henrique Volpini Stramasso · Gabriel Moreira Bittencourt · Lamys Bachir Fares

Engenharia de Computação — Universidade São Judas Tadeu — 2026.

## Funcionamento

1. A seguradora cadastra produtor, talhão, fontes e produto climático.
2. O produtor simula e solicita uma apólice, com carteira vinculada por assinatura.
3. A seguradora emite o contrato e deposita exatamente o limite de indenização como garantia.
4. O simulador envia leituras de estações por API ou MQTT, autenticadas por assinatura.
5. O oráculo valida as leituras, consolida os dias consecutivos sem chuva e preserva as evidências na fila e no registro de auditoria.
6. O contrato recebe o período, o índice climático e o SHA256 das leituras. Se o limiar for atingido, paga automaticamente a carteira do produtor na mesma transação.
7. O aplicativo acompanha os eventos e a API gera notificações e relatórios.

Um dia é seco quando a precipitação diária consolidada é menor que 1 mm. Primeiro somam-se as leituras de cada estação no dia; depois calcula-se a média dos totais das estações válidas. Um dia sem leitura válida interrompe a contagem. O oráculo recusa preparar publicação com menos de duas fontes válidas na série usada.

## Escopo

| Mantido | Removido |
|---|---|
| Cadastro, mapa do talhão e produtos de estiagem | Upload e geolocalização de fotografias |
| Cotação com histórico climático e carteira digital | Modelo, treino, inferência e confiança |
| Apólices, garantia e cancelamento antes da vigência | Índice de dano e operadores DANO, OU e E |
| Oráculo, reputação, fila e auditoria | Revisão do perito e retificação visual |
| Sensores simulados, assinatura e MQTT | Dependências PyTorch, FastAPI, EXIF e multipart |
| Eventos, notificações e relatórios | Endereços e medições da antiga implantação |

O mapa permanece para delimitar a área segurada. O contrato aceita exclusivamente `operador = 0` (CLIMÁTICO); esse campo é mantido no cadastro para identificar o tipo de produto.

## Instalação e demonstração

Use Node.js 24 LTS e npm. Python 3.10+ é necessário somente para o simulador MQTT.

```bash
git clone https://github.com/USJT2026TCC/AgroSmart---Sem-vis-o-computacional.git
cd AgroSmart---Sem-vis-o-computacional
cd contratos
npm ci
npm run testar
npx hardhat run scripts/demo-estiagem.js
```

A demonstração acima usa uma blockchain temporária em memória e não precisa de MetaMask ou dinheiro real. Para o aplicativo completo, siga [Como rodar](docs/COMO-RODAR.md). Para reutilizar sua configuração Sepolia original, o guia inclui `SEPOLIA.ps1`, que importa os `.env` localmente e implanta contratos novos.

## Módulos

| Pasta | Conteúdo |
|---|---|
| `contratos/` | ApolicePolicy, ApoliceFactory, OracleRegistry, scripts e testes de segurança |
| `oraculo/` | Consolidação, reputação, publicação climática e retomada de falhas |
| `backend/` | API, banco com PostGIS, ingestão, cotação, indexador e notificações |
| `app/` | React, produtor e seguradora, carteira e histórico em cadeia |
| `simulador/` | Python, séries climáticas históricas e transporte MQTT |

## Regras de pagamento

- **Integral:** paga 100% do limite ao atingir o número contratado de dias secos.
- **Proporcional ao primeiro acionamento:** paga 50% no gatilho, chegando a 100% no limiar integral, conforme o índice daquela publicação. O primeiro pagamento encerra a cobertura, mesmo que seja parcial. Não existem pagamentos complementares.

Exemplo independente: com gatilho de 30 dias e teto de 60, uma primeira publicação acionadora de 45 dias paga 75%. Com publicação diária desde o início, a primeira publicação de 30 dias já paga 50% e liquida a apólice.

O prêmio é cobrado fora da cadeia. O contrato guarda a garantia depositada pela seguradora.

## Compatibilidade e limites

Esta versão muda a ABI e o esquema do banco. **Use um banco novo e implante contratos novos.** Não aponte para o banco ou para contratos antigos. O Docker usa banco, volume, contêiner e porta próprios. Nenhuma implantação Sepolia antiga foi reutilizada.

O protótipo continua com oráculo de nó único. Assinaturas comprovam a origem dos dados, não a veracidade da medição. Fontes históricas reproduzidas não equivalem a sensores físicos instalados. A versão atual mantém publicação apenas dentro da vigência; uma falha que dure até depois dela pode impedir a publicação, e a fila não elimina esse limite. As medições locais de gas desta versão estão em [Validação](docs/VALIDACAO.md); os números da versão anterior não se aplicam e não há medição de custo em rede principal ou L2.

## Documentação

- [Como rodar](docs/COMO-RODAR.md)
- [Arquitetura e interfaces](docs/ARQUITETURA.md)
- [Mudanças e origem](docs/MUDANCAS.md)
- [Regras e requisitos](docs/REQUISITOS.md)
- [Validação](docs/VALIDACAO.md)
- [Dados climáticos e licenças](docs/DADOS.md)

As antigas versões Word e as evidências com imagens continuam no repositório original. Não foram apresentadas aqui como documentação válida desta versão.

## Segurança

Não versione `.env`, chaves privadas, tokens, bancos ou filas de execução. As contas Hardhat são públicas e servem exclusivamente para desenvolvimento local. Esta é uma prova de conceito acadêmica, sem validação atuarial ou regulatória e sem autorização para operar seguros reais.
