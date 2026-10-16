/** Medicao local da nova ABI, sem reutilizar numeros da versao anterior.
 * Uso: npx hardhat run scripts/custo-por-apolice.js
 * A projeção e condicionada ao numero de publicacoes ate o pagamento.
 */
const { ethers, network } = require("hardhat");
async function main() {
  if (network.name !== "hardhat")
    throw new Error("Execute em rede temporaria: npx hardhat run scripts/custo-por-apolice.js");
  const [seguradora, produtor, oraculo] = await ethers.getSigners();
  const registry = await ethers.deployContract("OracleRegistry", [seguradora.address]);
  await registry.autorizar(oraculo.address);
  const fabrica = await ethers.deployContract("ApoliceFactory", [
    await registry.getAddress(),
    seguradora.address,
  ]);
  const agora = (await ethers.provider.getBlock("latest")).timestamp;
  const limite = ethers.parseEther("1.08");
  const premio = (limite * 380n) / 10000n;
  const termos = {
    produtor: produtor.address,
    registry: ethers.ZeroAddress,
    cultura: ethers.encodeBytes32String("soja"),
    talhao: ethers.encodeBytes32String("talhao-01"),
    operador: 0,
    modoPagamento: 0,
    limiarClimatico: 30,
    limiarClimaticoIntegral: 0,
    vigenciaInicio: agora,
    vigenciaFim: agora + 180 * 86400,
    valorIndenizacao: limite,
    hashTermos: ethers.id("demonstracao-climatica-custo"),
  };
  const emissao = await (await fabrica.emitirApolice(termos)).wait();
  const apolice = await ethers.getContractAt("ApolicePolicy", await fabrica.apolices(0));
  const garantia = await (await apolice.depositarGarantia({ value: limite })).wait();
  const publicacao = await (
    await apolice.connect(oraculo).publicarIndices(20261001, 29, ethers.id("leituras-29"))
  ).wait();
  const pagamento = await (
    await apolice.connect(oraculo).publicarIndices(20261002, 30, ethers.id("leituras-30"))
  ).wait();
  const quantidade = Number(process.env.PUBLICACOES_ATE_PAGAMENTO || 30);
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 180)
    throw new Error("PUBLICACOES_ATE_PAGAMENTO deve ser inteiro de 1 a 180");
  const precoGwei = process.env.PRECO_REFERENCIA_GWEI || "0.5";
  const gasCiclo =
    emissao.gasUsed +
    garantia.gasUsed +
    BigInt(quantidade - 1) * publicacao.gasUsed +
    pagamento.gasUsed;
  const custoWei = gasCiclo * ethers.parseUnits(precoGwei, "gwei");
  console.log(
    JSON.stringify(
      {
        rede: network.name,
        compilador: "0.8.24",
        otimizador: { enabled: true, runs: 200 },
        gas: {
          emissao: String(emissao.gasUsed),
          garantia: String(garantia.gasUsed),
          publicacaoSemAcionamento: String(publicacao.gasUsed),
          publicacaoComPagamento: String(pagamento.gasUsed),
        },
        projecao: {
          publicacoesAtePagamento: quantidade,
          precoHipoteticoGwei: precoGwei,
          gasCiclo: String(gasCiclo),
          premioWei: String(premio),
          custoWei: String(custoWei),
          percentualDoPremio: Number((custoWei * 1000000n) / premio) / 10000,
          observacao:
            "Projecao com gas local; nao mede Sepolia, mainnet ou L2. Nao inclui infraestrutura compartilhada, falhas ou resgate.",
        },
      },
      null,
      2,
    ),
  );
}
main().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});
