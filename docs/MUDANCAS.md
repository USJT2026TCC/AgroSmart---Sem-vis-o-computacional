# Origem e mudanças

Origem: https://github.com/USJT2026TCC/SmartAgro

Commit de origem: `6b28fe724a9624628dfb8526d5bf9aa2b2ec9474`.

Destino: https://github.com/USJT2026TCC/AgroSmart---Sem-vis-o-computacional

A cópia foi preparada separadamente. Nenhum commit ou push foi enviado ao repositório original. O novo histórico começa com o estado climático, sem importar pesos de modelos ou documentos antigos.

## Remoções

Módulo `visao`, fotografias de demonstração, avaliações de modelos, upload de imagens, processamento EXIF, inferência, limiares de confiança, perfil de perito, contestação e retificação do índice visual. Os operadores DANO, OU e E e os campos de dano foram retirados de contrato, API, banco e interface.

## Preservações e adaptações

Cadastro geográfico, produtos, cotação, autenticação, carteira, garantia, cancelamento, pagamento, fila, reputação, MQTT, eventos e relatórios. Os produtos demonstrativos de milho também passam a ser climáticos. A evidência em cadeia agora é o hash das leituras, preservadas para auditoria.

O cadastro mantém um campo `operador` fixo em CLIMÁTICO (0). A API e o banco rejeitam outras opções; o enum Solidity também só tem esse valor.

## Migração

As migrações desta versão descrevem uma base nova. Não são uma atualização do banco original. A remoção de colunas e tabelas pressupõe banco novo, com volume e contêiner separados. Os contratos usam nova ABI e exigem nova implantação.

Os relatórios acadêmicos Word e as medições antigas permanecem na origem. Os requisitos antigos RF14 a RF17 e RF28 não pertencem ao novo escopo; a numeração histórica remanescente nos comentários não representa uma nova documentação acadêmica completa.

A retirada das imagens elimina dependência de inferência e revisão humana no fluxo climático. Não demonstra redução de custo específica sem novas medições, nem resolve a confiança no oráculo, a validade agronômica dos limiares ou o prazo de publicação após falhas prolongadas.
