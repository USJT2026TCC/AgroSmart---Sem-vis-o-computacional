# Dados climáticos

As séries meteorológicas reproduzidas pelo simulador vêm do INMET, incluindo as estações A770 e A747. O simulador Python pode reproduzir essas leituras históricas após o download dos arquivos oficiais. Já `backend/scripts/enviar-leituras.js`, a fonte simulada do oráculo e a demonstração local dos contratos geram cenários sintéticos determinísticos. Nenhum desses fluxos representa instrumentação física instalada ou validação de uma safra real.

Fonte oficial: https://portal.inmet.gov.br/dadoshistoricos

Os arquivos e instruções de preparação mantidos estão em `simulador/` e `backend/src/banco/dados/`. Consulte o README do simulador para a origem, os comandos e as referências específicas. Não há conjuntos de imagens ou pesos de modelos nesta versão.
