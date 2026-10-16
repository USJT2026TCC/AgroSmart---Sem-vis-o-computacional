import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { montar, entrar, com } from "./ajuda.js";
import { config } from "../src/config.js";
let ctx;
before(async () => {
  ctx = await montar();
});
after(async () => {
  await ctx?.fechar();
});
test("a nova base so cria produtos climaticos e nao cria tabelas de imagens", async () => {
  const { rows } = await ctx.banco.query("SELECT operador FROM produtos");
  assert.ok(rows.length > 0);
  assert.ok(rows.every((p) => p.operador === 0));
  const tabelas = await ctx.banco.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
  );
  assert.ok(!tabelas.rows.some((t) => /imagem|contestacao/.test(t.tablename)));
});
test("endpoints de visao, upload e revisao nao estao disponiveis", async () => {
  const token = await entrar(ctx.api, "produtor");
  for (const rota of ["/lotes", "/perito/analises", "/contestacoes"]) {
    const r = await ctx.api().get(`/api${rota}`).set(com(token));
    assert.equal(r.status, 404, rota);
  }
  const r = await ctx
    .api()
    .get("/api/oraculo/visao?talhao=talhao-01&ate=20261001")
    .set("X-Chave-De-Servico", config.chaveDeServico);
  assert.equal(r.status, 404);
});
