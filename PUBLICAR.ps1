# Execute na raiz desta copia, depois de autenticar o Git no seu computador.
$ErrorActionPreference = "Stop"
$destinoAgro = "https://github.com/USJT2026TCC/AgroSmart---Sem-vis-o-computacional.git"
Set-Location $PSScriptRoot
if (-not (Test-Path ".git")) {
    git init -b main
    if ($LASTEXITCODE -ne 0) { throw "Falha ao iniciar Git." }
    git add .
    git commit -m "Criar versao climatica do AgroSmart sem visao computacional"
    if ($LASTEXITCODE -ne 0) { throw "Configure seu nome e e-mail do Git e repita." }
}
$remotosAgro = @(git remote)
if ($remotosAgro -contains "origin") { git remote set-url origin $destinoAgro }
else { git remote add origin $destinoAgro }
git push -u origin HEAD:main
if ($LASTEXITCODE -ne 0) { throw "O envio nao foi concluido. Confira autenticacao e o repositorio de destino. Nenhum force push foi usado." }
