# Como rodar a versão climática

Execute cada serviço em um terminal. Os comandos partem da raiz do novo repositório. Não reutilize `.env`, banco ou endereços da versão anterior.

## Instalar

Use Node.js 24 e npm. Em cada pasta `contratos`, `backend`, `oraculo` e `app`, execute `npm ci`.

## Blockchain local

No primeiro terminal:

```bash
cd contratos
npm run no
```

No segundo terminal:

```bash
cd contratos
npm run implantar:local
npx hardhat run scripts/emitir-apolice.js --network localhost
```

O último comando emite uma apólice climática de demonstração. Para emitir pelo aplicativo, basta implantar a infraestrutura; a emissão acontece na tela Propostas da seguradora.

## API e banco

Para começar sem instalar PostgreSQL, em um novo terminal:

```bash
cd backend
npm run iniciar
```

Sem `.env`, usa PGlite com PostGIS na pasta `backend/dados/pg`. Os dados de desenvolvimento são criados automaticamente. Usuários `produtor` e `seguradora`, senha `agrosmart`.

Alternativa com Docker, a partir da raiz:

```bash
docker compose up -d
```

Copie `backend/.env.example` para `backend/.env` para usar o banco Docker em `localhost:5434/agrosmart_climatico`. O contêiner e o volume têm nomes próprios. Para copiar no PowerShell, use `Copy-Item backend/.env.example backend/.env`. Nunca use a URL do banco original.

## Aplicativo

```bash
cd app
npm run dev
```

Abra `http://localhost:5173`. A sincronização dos endereços locais roda antes do Vite. Conecte MetaMask à rede local, chainId 31337, RPC `http://127.0.0.1:8545`. Use as contas de teste mostradas pelo Hardhat: conta 0 para seguradora, conta 1 para produtor, conta 2 para oráculo. Nunca use essas contas em redes com valor real.

Se a versão original estiver em execução nas mesmas portas, encerre seus processos antes de iniciar esta versão. Isso não altera o código ou o banco original.

## Publicar clima com o oráculo

Copie `oraculo/.env.example` para `.env`. Defina `CHAVE_PRIVADA_ORACULO` com a conta local 2 mostrada pelo Hardhat e `ENDERECO_APOLICE` com o endereço impresso na emissão da apólice. O script de implantação autoriza essa conta no registro. Não envie o arquivo ao GitHub.

Com a apólice emitida pelo script:

```bash
cd oraculo
node src/index.js publicar --cenario estiagem_severa
```

O oráculo exige `ENDERECO_APOLICE` no `.env` ou `--apolice ENDERECO`; não seleciona automaticamente a última apólice. Sem `--periodo`, usa o dia atual em UTC. O exemplo acima gera um cenário sintético e não consulta sensores. Para a fonte integrada, configure `API_URL=http://localhost:3001/api` e `CHAVE_DE_SERVICO` com o mesmo valor do backend, e use `--fonte backend`. Em desenvolvimento sem segredo personalizado no backend, o valor é `desenvolvimento-apenas-nao-use-em-producao`.

Para inserir as leituras sintéticas assinadas do cenário de demonstração no backend:

```bash
cd backend
npm run enviar-leituras
```

Confira no terminal a data final das leituras. Publique com `node src/index.js publicar --fonte backend --periodo AAAAMMDD`, substituindo `AAAAMMDD` pela data final impressa; a data de referência identifica a série climática, enquanto a transação precisa ocorrer dentro da vigência da apólice.

O simulador MQTT é opcional; consulte `simulador/README.md`. Não há servidor de inferência para iniciar.

## Testar

Execute `npm run testar` em contratos, oráculo, backend e app. Em `app`, execute também `npm run build`. Após compilar os contratos, execute `npm run testar:integracao` no oráculo e no backend. A demonstração isolada roda com `npx hardhat run scripts/demo-estiagem.js` em contratos. Para os testes Python, entre em `simulador`, instale `python -m pip install -e ".[dev]"` em um ambiente virtual e execute `python -m pytest`. Três testes exigem o ZIP INMET de 2024 e são ignorados quando ele não está disponível.

## Sepolia

É necessário implantar nova infraestrutura desta versão e emitir novas apólices. Configure RPC e contas próprias nos `.env.example`, e execute `npm run implantar:sepolia` em contratos. Essa operação não foi executada como parte da preparação deste projeto; a validação registrada é local. Não copie os JSONs de implantação do repositório original.
