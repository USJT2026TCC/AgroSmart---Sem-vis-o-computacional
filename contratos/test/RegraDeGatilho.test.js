const { expect } = require("chai");
const { cenarioApoliceAtiva } = require("./helpers");
describe("Equivalencia climatica entre contrato e aplicativo", function () {
  let regra;
  before(async () => {
    regra = await import("../../app/src/cadeia/regraDeGatilho.js");
  });
  for (const modoPagamento of [0, 1]) {
    it(`concorda nos limites e arredondamentos, modo ${modoPagamento}`, async function () {
      const { apolice, termos } = await cenarioApoliceAtiva({
        modoPagamento,
        limiarClimaticoIntegral: 60,
      });
      for (const dias of [0, 1, 29, 30, 31, 44, 45, 46, 59, 60, 61, 1000]) {
        const percentual = await apolice.simularPercentual(dias);
        expect(regra.percentualDevido(termos, dias)).to.equal(Number(percentual));
        expect(regra.valorDevido(termos, dias)).to.equal(
          (termos.valorIndenizacao * percentual) / 10000n,
        );
      }
      const exemplos = regra.exemplosDeAcionamento(termos);
      expect(exemplos.some((e) => e.percentualBps === 0)).to.equal(true);
      expect(exemplos.some((e) => e.percentualBps === 10000)).to.equal(true);
    });
  }
});
