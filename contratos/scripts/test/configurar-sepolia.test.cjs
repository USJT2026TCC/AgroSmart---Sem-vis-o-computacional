const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const dotenv = require("dotenv");
const { HDNodeWallet } = require("ethers");
const { preparar } = require("../configurar-sepolia");

const frasePublica = "test test test test test test test test test test test junk";
const conta = (i) => HDNodeWallet.fromPhrase(frasePublica, undefined, `m/44'/60'/0'/0/${i}`);
function cenario(t) {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), "clima-config-"));
  t.after(() => fs.rmSync(pasta, { recursive: true, force: true }));
  const original = path.join(pasta, "original"),
    novo = path.join(pasta, "novo");
  for (const raiz of [original, novo]) {
    for (const m of ["contratos", "backend", "oraculo", "app"])
      fs.mkdirSync(path.join(raiz, m), { recursive: true });
  }
  fs.mkdirSync(path.join(original, "contratos/implantacoes"));
  fs.writeFileSync(
    path.join(original, "contratos/implantacoes/sepolia.json"),
    JSON.stringify({
      chainId: 11155111,
      seguradora: conta(0).address,
      oraculoAutorizado: conta(2).address,
      contratos: { ApoliceFactory: "contrato-antigo-nao-copiar" },
    }),
  );
  const env = path.join(original, "contratos/.env");
  fs.writeFileSync(
    env,
    `RPC_SEPOLIA=https://rpc.invalid/teste\nCHAVE_PRIVADA_SEGURADORA=${conta(0).privateKey}\nCHAVE_PRIVADA_ORACULO=${conta(2).privateKey}\n`,
  );
  fs.writeFileSync(
    path.join(original, "backend/.env"),
    "DATABASE_URL=postgres://banco-original\nDIR_BANCO=C:\\novo\\teste\nCHAVE_DE_SERVICO=segredo-original\n",
  );
  return { original, novo, env };
}
function nenhumaCopia(novo) {
  assert.ok(!fs.existsSync(path.join(novo, "contratos/.env")));
  assert.ok(!fs.existsSync(path.join(novo, "oraculo/.env")));
}

test("reutiliza credenciais e preserva o original, sem copiar banco ou contratos", (t) => {
  const { original, novo, env } = cenario(t);
  const antes = fs.readFileSync(env, "utf8");
  preparar(original, novo);
  const b = dotenv.parse(fs.readFileSync(path.join(novo, "backend/.env")));
  const o = dotenv.parse(fs.readFileSync(path.join(novo, "oraculo/.env")));
  const c = dotenv.parse(fs.readFileSync(path.join(novo, "contratos/.env")));
  assert.equal(b.DATABASE_URL, "");
  assert.ok(b.DIR_BANCO.startsWith(novo));
  assert.equal(b.REDE, "sepolia");
  assert.equal(b.CHAVE_DE_SERVICO, o.CHAVE_DE_SERVICO);
  assert.equal(c.CHAVE_PRIVADA_SEGURADORA, conta(0).privateKey);
  assert.equal(c.ENDERECO_ORACULO, conta(2).address);
  assert.equal(o.ENDERECO_APOLICE, undefined);
  assert.equal(fs.readFileSync(env, "utf8"), antes);
  assert.ok(!fs.existsSync(path.join(novo, "contratos/implantacoes/sepolia.json")));
});
test("recusa credenciais ausentes sem gerar chaves", (t) => {
  const { original, novo, env } = cenario(t);
  fs.writeFileSync(env, "RPC_SEPOLIA=https://rpc.invalid\n");
  assert.throws(() => preparar(original, novo), /CHAVE_PRIVADA_SEGURADORA/);
  nenhumaCopia(novo);
});
test("recusa carteiras diferentes das usadas no projeto original", (t) => {
  const { original, novo, env } = cenario(t);
  fs.appendFileSync(env, `CHAVE_PRIVADA_SEGURADORA=${conta(3).privateKey}\n`);
  assert.throws(() => preparar(original, novo), /nao coincidem/);
  nenhumaCopia(novo);
});
test("nao sobrescreve configuracoes existentes", (t) => {
  const { original, novo } = cenario(t);
  fs.writeFileSync(path.join(novo, "backend/.env"), "PRESERVAR=sim\n");
  assert.throws(() => preparar(original, novo), /Nenhum arquivo foi sobrescrito/);
  assert.equal(fs.readFileSync(path.join(novo, "backend/.env"), "utf8"), "PRESERVAR=sim\n");
  nenhumaCopia(novo);
});
test("recusa segredo de servico divergente", (t) => {
  const { original, novo } = cenario(t);
  fs.writeFileSync(path.join(original, "oraculo/.env"), "CHAVE_DE_SERVICO=outro\n");
  assert.throws(() => preparar(original, novo), /CHAVE_DE_SERVICO difere/);
  nenhumaCopia(novo);
});
test("prefere .env.sepolia ao arquivo da rede local", (t) => {
  const { original, novo, env } = cenario(t);
  fs.copyFileSync(env, path.join(original, "contratos/.env.sepolia"));
  fs.writeFileSync(env, "RPC_SEPOLIA=\n");
  assert.equal(preparar(original, novo).seguradora, conta(0).address);
});
test("erro de chave invalida nao revela o valor", (t) => {
  const { original, novo, env } = cenario(t);
  fs.appendFileSync(env, "CHAVE_PRIVADA_SEGURADORA=valor-invalido-nao-exibir\n");
  assert.throws(
    () => preparar(original, novo),
    (e) =>
      !e.message.includes("valor-invalido-nao-exibir") && /Chave privada invalida/.test(e.message),
  );
  nenhumaCopia(novo);
});
test("recusa a propria pasta como origem", (t) => {
  const { original } = cenario(t);
  assert.throws(() => preparar(original, original), /separada/);
});
