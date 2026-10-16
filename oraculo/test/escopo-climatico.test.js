const test = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { ServicoOraculo } = require("../src/oraculo");
const { gerarLeituras } = require("../src/fonteSimulada");
const { RegistroReputacao } = require("../src/reputacao");
function montar() {
  let gravada;
  const servico = new ServicoOraculo({
    publicador: {},
    registro: {},
    reputacao: new RegistroReputacao(),
    fila: {
      enfileirar: (e) => {
        gravada = e;
        return { entrada: e, novo: true };
      },
    },
  });
  return { servico, gravada: () => gravada };
}
test("publica so clima, preservando as leituras e seu SHA256", () => {
  const { servico, gravada } = montar();
  const leituras = gerarLeituras({ cenario: "estiagem_severa", periodoFinal: 20261020, dias: 90 });
  servico.prepararPublicacao({ apolice: "0x01", periodo: 20261020, leituras });
  const p = gravada().payload;
  assert.equal(
    p.hashLeituras,
    "0x" + createHash("sha256").update(JSON.stringify(leituras)).digest("hex"),
  );
  assert.deepEqual(p.leituras, leituras);
  assert.ok(!("indiceDanoBps" in p));
  assert.ok(!("versaoModelo" in p));
});
test("uma unica fonte nao autoriza publicacao climatica", () => {
  const { servico, gravada } = montar();
  const leituras = [{ fonte: "unica", timestamp: "2026-10-20T12:00:00Z", chuvaMm: 0 }];
  assert.throws(
    () => servico.prepararPublicacao({ apolice: "0x01", periodo: 20261020, leituras }),
    /duas fontes/,
  );
  assert.equal(gravada(), undefined);
});
