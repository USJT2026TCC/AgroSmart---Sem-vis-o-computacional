/** Importa a configuracao privada existente sem copiar contratos ou banco antigos. */
const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");
const { Wallet, getAddress } = require("ethers");

const RAIZ = path.resolve(__dirname, "../..");

function lerEnv(raiz, modulo) {
  for (const nome of [".env.sepolia", ".env"]) {
    const arquivo = path.join(raiz, modulo, nome);
    if (fs.existsSync(arquivo)) return dotenv.parse(fs.readFileSync(arquivo));
  }
  return {};
}

function selecionar(origem, nomes) {
  return Object.fromEntries(nomes.filter((n) => origem[n]).map((n) => [n, origem[n]]));
}

function preparar(original, destino = RAIZ) {
  original = fs.realpathSync(original);
  destino = fs.realpathSync(destino);
  if (original === destino)
    throw new Error("Informe a pasta do projeto original, separada desta versao.");
  const arquivoImplantacao = path.join(original, "contratos/implantacoes/sepolia.json");
  const anterior = JSON.parse(fs.readFileSync(arquivoImplantacao, "utf8"));
  if (anterior.chainId !== 11155111)
    throw new Error("A implantacao original nao identifica a Sepolia.");

  const contratos = lerEnv(original, "contratos");
  const oraculo = lerEnv(original, "oraculo");
  const backend = lerEnv(original, "backend");
  const app = lerEnv(original, "app");
  const chaveSeguradora = contratos.CHAVE_PRIVADA_SEGURADORA;
  const chaveOraculo = contratos.CHAVE_PRIVADA_ORACULO || oraculo.CHAVE_PRIVADA_ORACULO;
  const rpc = contratos.RPC_SEPOLIA;
  const faltantes = [
    !rpc && "RPC_SEPOLIA",
    !chaveSeguradora && "CHAVE_PRIVADA_SEGURADORA",
    !chaveOraculo && "CHAVE_PRIVADA_ORACULO",
  ].filter(Boolean);
  if (faltantes.length)
    throw new Error(
      `Faltam no projeto original: ${faltantes.join(", ")}. Nenhum segredo foi gerado.`,
    );
  let seguradora, enderecoOraculo;
  try {
    seguradora = new Wallet(chaveSeguradora).address;
    enderecoOraculo = new Wallet(chaveOraculo).address;
  } catch {
    throw new Error(
      "Chave privada invalida na configuracao original; os valores nao serao exibidos.",
    );
  }
  if (
    seguradora !== getAddress(anterior.seguradora) ||
    enderecoOraculo !== getAddress(anterior.oraculoAutorizado)
  ) {
    throw new Error(
      "As carteiras configuradas nao coincidem com a implantacao Sepolia original. Revise a configuracao antes de continuar.",
    );
  }
  if (seguradora === enderecoOraculo)
    throw new Error("Seguradora e oraculo precisam de carteiras distintas.");
  if (
    backend.CHAVE_DE_SERVICO &&
    oraculo.CHAVE_DE_SERVICO &&
    backend.CHAVE_DE_SERVICO !== oraculo.CHAVE_DE_SERVICO
  ) {
    throw new Error("CHAVE_DE_SERVICO difere entre backend e oraculo no projeto original.");
  }
  const servico = backend.CHAVE_DE_SERVICO || oraculo.CHAVE_DE_SERVICO;
  if (!servico) {
    throw new Error(
      "CHAVE_DE_SERVICO nao encontrada nos arquivos privados originais. Informe a configuracao existente antes de continuar.",
    );
  }
  const comum = { CHAVE_DE_SERVICO: servico };
  const configuracoes = {
    contratos: {
      ...selecionar(contratos, [
        "ETHERSCAN_API_KEY",
        "PRECO_GAS_GWEI",
        "ENDERECO_PRODUTOR",
        "LIMIAR_DIAS",
        "VALOR_INDENIZACAO",
        "CULTURA",
        "TALHAO",
      ]),
      RPC_SEPOLIA: rpc,
      CHAVE_PRIVADA_SEGURADORA: chaveSeguradora,
      CHAVE_PRIVADA_ORACULO: chaveOraculo,
      ENDERECO_ORACULO: enderecoOraculo,
    },
    backend: {
      ...selecionar(backend, [
        "SEGREDO_DE_CIFRA",
        "ORIGEM_APP",
        "HORAS_DE_SESSAO",
        "INTERVALO_INDEXADOR_MS",
      ]),
      ...comum,
      REDE: "sepolia",
      RPC_URL: rpc,
      DATABASE_URL: "",
      DIR_BANCO: path.join(destino, "backend/dados/sepolia-climatica/pg"),
      DIR_EMAILS: path.join(destino, "backend/dados/sepolia-climatica/emails"),
    },
    oraculo: {
      ...selecionar(oraculo, [
        "LIMIAR_CHUVA_MM",
        "LIMIAR_REPUTACAO",
        "MAX_TENTATIVAS",
        "ESPERA_BASE_MS",
        "CONFIRMACOES",
        "TIMEOUT_MS",
        "INTERVALO_SERVICO_MS",
      ]),
      ...comum,
      REDE: "sepolia",
      RPC_URL: rpc,
      CHAVE_PRIVADA_ORACULO: chaveOraculo,
      DIR_DADOS: "dados-sepolia",
      API_URL: "http://localhost:3001/api",
    },
    app: { ...selecionar(app, ["VITE_RPC_SEPOLIA"]), VITE_REDE: "sepolia" },
  };
  const arquivos = Object.keys(configuracoes).map((m) => path.join(destino, m, ".env"));
  if (arquivos.some((a) => fs.existsSync(a)))
    throw new Error(
      "Ja existe um .env no novo projeto. Nenhum arquivo foi sobrescrito; revise a configuracao existente.",
    );
  const bancoNovo = configuracoes.backend.DIR_BANCO;
  if (fs.existsSync(bancoNovo))
    throw new Error(
      "O diretorio de banco Sepolia desta versao ja existe. Use um banco novo ou revise a execucao anterior.",
    );
  const textos = Object.entries(configuracoes).map(([modulo, valores]) => {
    const linhas = Object.entries(valores).map(([k, v]) => {
      const valor = String(v);
      const aspas = ["'", "`"].find((a) => !valor.includes(a));
      if (!aspas || /[\r\n]/.test(valor))
        throw new Error(`Valor nao suportado em ${k}; revise a configuracao local.`);
      return `${k}=${aspas}${valor}${aspas}`;
    });
    return [
      path.join(destino, modulo, ".env"),
      "# Importado localmente do projeto original. Nunca versionar.\n" + linhas.join("\n") + "\n",
    ];
  });
  for (const [arquivo, texto] of textos)
    fs.writeFileSync(arquivo, texto, { flag: "wx", mode: 0o600 });
  return {
    seguradora,
    oraculo: enderecoOraculo,
    arquivos: arquivos.map((a) => path.relative(destino, a)),
  };
}

if (require.main === module) {
  try {
    if (!process.argv[2])
      throw new Error(
        'Uso: node contratos/scripts/configurar-sepolia.js "CAMINHO_DO_PROJETO_ORIGINAL"',
      );
    const r = preparar(process.argv[2]);
    console.log("Configuracao importada. Banco novo; contratos antigos nao foram copiados.");
    console.log(`Seguradora: ${r.seguradora}\nOraculo: ${r.oraculo}`);
    console.log(`Arquivos privados criados: ${r.arquivos.join(", ")}`);
    console.log(
      "Nenhuma transacao enviada. Proximo passo: cd contratos && npm run implantar:sepolia",
    );
  } catch (erro) {
    // Nao imprime mensagens de bibliotecas que possam conter RPC ou chave.
    const mensagem = erro.code
      ? "Nao foi possivel ler/gravar os arquivos; confira os caminhos e permissoes."
      : erro.message;
    console.error(mensagem);
    process.exitCode = 1;
  }
}
module.exports = { preparar };
