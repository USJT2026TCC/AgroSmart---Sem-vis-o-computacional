const { expect } = require("chai");
const { ethers, artifacts } = require("hardhat");

describe("Interfaces usadas pelo aplicativo, API e oraculo", function () {
  it("todas as assinaturas e estruturas correspondem aos contratos compilados", async function () {
    const app = await import("../../app/src/cadeia/abis.js");
    const backend = await import("../../backend/src/cadeia/abis.js");
    const oraculo = require("../../oraculo/src/abi.js");
    for (const consumidor of [app, backend, oraculo]) {
      for (const [chave, contrato] of [["ABI_APOLICE", "ApolicePolicy"], ["ABI_FACTORY", "ApoliceFactory"], ["ABI_REGISTRY", "OracleRegistry"]]) {
        if (!consumidor[chave]) continue;
        const real = new ethers.Interface((await artifacts.readArtifact(contrato)).abi);
        for (const f of new ethers.Interface(consumidor[chave]).fragments) {
          const assinatura = f.format("sighash");
          const correspondente = f.type === "function" ? real.getFunction(assinatura)
            : f.type === "event" ? real.getEvent(assinatura) : real.getError(assinatura);
          expect(correspondente, `${contrato}: ${assinatura}`).not.to.equal(null);
          if (f.outputs) expect(f.outputs.map(p => p.format("sighash")))
            .to.deep.equal(correspondente.outputs.map(p => p.format("sighash")));
          if (f.type === "event") expect(f.inputs.map(p => !!p.indexed))
            .to.deep.equal(correspondente.inputs.map(p => !!p.indexed));
        }
      }
    }
  });
});
