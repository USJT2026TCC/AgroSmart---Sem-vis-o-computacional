param([string]$ProjetoOriginal)
$ErrorActionPreference = "Stop"
if (-not $ProjetoOriginal) {
    $ProjetoOriginal = Read-Host "Caminho completo da pasta SmartAgro original (com os .env configurados)"
}
$Raiz = $PSScriptRoot
$Npm = if (Get-Command npm.cmd -ErrorAction SilentlyContinue) { "npm.cmd" } else { "npm" }
foreach ($Modulo in @("contratos", "backend", "oraculo", "app")) {
    Push-Location (Join-Path $Raiz $Modulo)
    try {
        & $Npm ci
        if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar $Modulo." }
    } finally { Pop-Location }
}
& node (Join-Path $Raiz "contratos/scripts/configurar-sepolia.js") $ProjetoOriginal
if ($LASTEXITCODE -ne 0) { throw "Configuracao interrompida. Nenhuma implantacao foi iniciada." }
Push-Location (Join-Path $Raiz "contratos")
try {
    & $Npm run implantar:sepolia
    if ($LASTEXITCODE -ne 0) { throw "Implantacao interrompida. Confira o terminal antes de repetir." }
} finally { Pop-Location }
& node (Join-Path $Raiz "app/scripts/sincronizar-enderecos.mjs")
if ($LASTEXITCODE -ne 0) { throw "Falha ao sincronizar enderecos." }
Write-Host "Infraestrutura implantada. Veja contratos/implantacoes/sepolia.json."
Write-Host "Nenhuma apolice foi emitida; nenhum pagamento ou deposito de garantia foi enviado."
Write-Host "Inicie API e aplicativo em terminais separados: backend: npm.cmd run iniciar; app: npm.cmd run dev."
Write-Host "No aplicativo, vincule a carteira Sepolia do produtor por assinatura. O banco desta versao e novo."
