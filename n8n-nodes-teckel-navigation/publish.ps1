param(
    [ValidateSet('patch','minor','major','none')]
    [string]$BumpType = 'patch',
    [switch]$DryRun,
    [string]$Otp = ''
)

$PackageDir = $PSScriptRoot
$pkgJson = Get-Content "$PackageDir\package.json" -Raw | ConvertFrom-Json

Write-Host "Package  : $($pkgJson.name)"
Write-Host "Version  : $($pkgJson.version)"

if ($BumpType -ne 'none' -and -not $DryRun) {
    Write-Host "==> Bumping $BumpType version..."
    Push-Location $PackageDir
    npm version $BumpType --no-git-tag-version
    if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Error "npm version failed"; exit 1 }
    Pop-Location
    $pkgJson = Get-Content "$PackageDir\package.json" -Raw | ConvertFrom-Json
    Write-Host "New version: $($pkgJson.version)"
}

Write-Host "==> Building..."
docker run --rm -v "${PackageDir}:/pkg" node:18-alpine sh -c "cd /pkg && rm -rf dist && npm install --ignore-scripts && npm run build"
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed"; exit 1 }

if ($DryRun) {
    Write-Host "==> Dry run - running npm pack (no publish, no version bump)"
    Push-Location $PackageDir
    npm pack --dry-run
    Pop-Location
    exit 0
}

$answer = Read-Host "Publish $($pkgJson.name)@$($pkgJson.version) to npm? (y/N)"
if ($answer -notin @('y','Y')) { Write-Host "Aborted."; exit 0 }

Write-Host "==> Publishing..."
Push-Location $PackageDir
if ($Otp) { npm publish --otp=$Otp } else { npm publish }
if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Error "npm publish failed"; exit 1 }
Pop-Location

Write-Host "==> Done: $($pkgJson.name)@$($pkgJson.version) published."
