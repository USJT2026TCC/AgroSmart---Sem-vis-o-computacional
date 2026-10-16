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

É necessário implantar nova infraestrutura desta versão e emitir novas apólices. As carteiras e o RPC podem ser os mesmos do projeto original; os endereços dos contratos e o banco precisam ser novos. Nenhuma implantação Sepolia foi executada nesta preparação: as credenciais privadas não estão no GitHub nem no ambiente de validação.

### Reaproveitar a configuração do projeto original no Windows

Tenha as duas pastas separadas no computador e atualize a nova com `git pull`. Abra o PowerShell na raiz da **nova versão** e execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\SEPOLIA.ps1
```

O comando pede o caminho da pasta original, instala as dependências, importa as configurações privadas, implanta a nova infraestrutura e sincroniza os endereços do aplicativo. A opção de execução vale somente para esse processo. O script usa `npm.cmd` no Windows, evitando o bloqueio de `npm.ps1`.

O importador procura `.env.sepolia` e, se ele não existir, `.env` em cada módulo original. Exige `RPC_SEPOLIA`, a chave da seguradora, a chave do oráculo e `CHAVE_DE_SERVICO` da integração API/oráculo; confere as duas carteiras contra `contratos/implantacoes/sepolia.json` do original. Não gera carteiras, não copia os contratos antigos e não sobrescreve `.env` já existente na nova pasta. Se uma conferência falhar, leia o erro antes de continuar; nenhum segredo é exibido.

O backend fica configurado para a Sepolia com PGlite novo em `backend/dados/sepolia-climatica/pg`, e o oráculo usa uma fila própria. A API local é `http://localhost:3001/api`; o aplicativo usa a Sepolia. Não são importados o banco original, sessões, caminhos de certificados, SMTP ou hospedagem. Essa configuração é para demonstração no computador. Inicie um projeto por vez nas portas padrão.

Depois da implantação, o registro público está em `contratos/implantacoes/sepolia.json`. Inicie a API em `backend` com `npm.cmd run iniciar` e o aplicativo em `app` com `npm.cmd run dev`. Conecte MetaMask à Sepolia, entre como produtor e vincule sua carteira por assinatura; o banco novo ainda contém a carteira Hardhat da demonstração local até esse vínculo. Use a mesma carteira da seguradora para emitir as novas apólices. O script de preparação não emite apólices nem deposita garantias.

Para publicar automaticamente os índices das apólices ativas, rode em `oraculo`:

```bash
node src/index.js servico
```

É necessário cadastrar/enviar leituras válidas para o talhão. A preparação não fabrica dados meteorológicos nem publica índices. Para testes com leituras sintéticas ou históricas, siga as seções anteriores e o README do simulador. No comando de publicação manual, informe o endereço da **nova** apólice; o endereço antigo não é importado.

### Execução manual em outros sistemas

Após `npm ci` nos quatro módulos, execute na raiz da nova versão:

```bash
node contratos/scripts/configurar-sepolia.js "CAMINHO_DA_PASTA_ORIGINAL"
cd contratos
npm run implantar:sepolia
cd ../app
npm run enderecos
```

Substitua o caminho pela pasta real. Os testes do importador rodam em `contratos` com `npm run testar:configuracao`. Eles usam somente credenciais públicas de desenvolvimento e RPC fictício sem conexão de rede; não validam o saldo ou a disponibilidade do seu RPC Sepolia.

Sem a pasta privada original, configure os `.env.example` manualmente. Não envie chaves privadas ou frases de recuperação pelo chat e não versione os `.env`. Se uma implantação falhar após enviar alguma transação, confira os endereços e recibos no terminal antes de repetir, pois a execução pode ter ficado parcial.
