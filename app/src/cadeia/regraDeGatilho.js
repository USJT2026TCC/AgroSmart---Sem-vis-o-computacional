/** Regra climatica espelhada em ApolicePolicy.sol e verificada pelos testes de equivalencia. */
export const BPS = 10_000;
export const PISO_ESCALONADO_BPS = 5_000;
export const OPERADOR = { CLIMATICO: 0 };
export const MODO_PAGAMENTO = { INTEGRAL: 0, ESCALONADO: 1 };
export const SITUACAO = ["AGUARDANDO_GARANTIA", "ATIVA", "LIQUIDADA", "ENCERRADA", "CANCELADA"];
export function percentualDevido(t, dias) {
  const gatilho = Number(t.limiarClimatico);
  if (Number(dias) < gatilho) return 0;
  if (Number(t.modoPagamento) === MODO_PAGAMENTO.INTEGRAL) return BPS;
  const teto = Number(t.limiarClimaticoIntegral);
  if (Number(dias) >= teto) return BPS;
  return PISO_ESCALONADO_BPS + Math.floor((5000 * (Number(dias) - gatilho)) / (teto - gatilho));
}
export function valorDevido(t, dias) {
  return (BigInt(t.valorIndenizacao) * BigInt(percentualDevido(t, dias))) / BigInt(BPS);
}
export function exemplosDeAcionamento(t) {
  const gatilho = Number(t.limiarClimatico);
  const teto = Number(t.limiarClimaticoIntegral);
  const pontos = [
    Math.max(0, gatilho - 10),
    Math.max(0, gatilho - 1),
    gatilho,
    gatilho + Math.max(1, Math.round((teto - gatilho) / 2)),
    teto > gatilho ? teto : gatilho + 15,
  ];
  return [...new Set(pontos)]
    .sort((a, b) => a - b)
    .map((diasSemChuva) => ({
      diasSemChuva,
      percentualBps: percentualDevido(t, diasSemChuva),
      valorWei: valorDevido(t, diasSemChuva),
    }));
}
export function condicaoEmPalavras(t) {
  const gatilho = `Se o talhao passar ${t.limiarClimatico} dias seguidos sem chuva`;
  if (Number(t.modoPagamento) === MODO_PAGAMENTO.INTEGRAL)
    return `${gatilho}, o contrato paga o limite integral.`;
  return `${gatilho}, o contrato faz um unico pagamento proporcional ao indice publicado: 50% no gatilho e 100% em ${t.limiarClimaticoIntegral} dias. O primeiro pagamento encerra a cobertura; nao ha complementos posteriores.`;
}
