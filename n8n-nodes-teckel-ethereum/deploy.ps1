param(
    [string]$Server = "192.168.1.114",
    [string]$User = "yusuf",
    [string]$ServiceFilter = "n8n1",
    [string]$PuttyDir = "C:\Program Files\PuTTY",
    [string]$KeyFile = "",    # .ppk for PuTTY, or OpenSSH key path when -NoPutty
    [string]$Session = "",    # PuTTY saved session name (overrides Server/User if set)
    [switch]$NoPutty          # use Windows OpenSSH (ssh.exe/scp.exe) instead of PuTTY
)

$PackageDir = $PSScriptRoot

Write-Host "==> Building package..."
docker run --rm -v "${PackageDir}:/pkg" node:18-alpine sh -c "cd /pkg && rm -rf dist && npm install --ignore-scripts && npm run build"
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed"; exit 1 }

$usePutty = (-not $NoPutty) -and (Test-Path "$PuttyDir\pscp.exe")
$scpCmd  = if ($usePutty) { "$PuttyDir\pscp.exe" } else { "scp" }
$sshCmd  = if ($usePutty) { "$PuttyDir\plink.exe" } else { "ssh" }
if ($usePutty) { Write-Host "==> Using PuTTY tools from $PuttyDir" }
else           { Write-Host "==> Using OpenSSH" }

$sshTarget = if ($Session) { $Session } else { "${User}@${Server}" }
$scpTarget = if ($Session) { "${Session}:/tmp/" } else { "${User}@${Server}:/tmp/" }

function Invoke-Ssh([string]$Cmd) {
    if ($usePutty -and $KeyFile) { & $sshCmd -batch -i $KeyFile $sshTarget $Cmd }
    elseif ($usePutty)           { & $sshCmd -batch $sshTarget $Cmd }
    elseif ($KeyFile)            { & $sshCmd -o BatchMode=yes -o StrictHostKeyChecking=accept-new -i $KeyFile "${User}@${Server}" $Cmd }
    else                         { & $sshCmd -o BatchMode=yes -o StrictHostKeyChecking=accept-new "${User}@${Server}" $Cmd }
}

Write-Host "==> Resolving container ID for service '$ServiceFilter' on ${Server}..."
$ContainerName = Invoke-Ssh "docker ps --filter name=${ServiceFilter} --format '{{.ID}}' | head -1"
if (-not $ContainerName) { Write-Error "Could not find a running container matching '$ServiceFilter'"; exit 1 }
Write-Host "==> Found container: $ContainerName"

Write-Host "==> Copying to ${Server}..."
if ($usePutty) {
    & $scpCmd -r $PackageDir $scpTarget
} elseif ($KeyFile) {
    & $scpCmd -o BatchMode=yes -o StrictHostKeyChecking=accept-new -i $KeyFile -r $PackageDir $scpTarget
} else {
    & $scpCmd -o BatchMode=yes -o StrictHostKeyChecking=accept-new -r $PackageDir $scpTarget
}
if ($LASTEXITCODE -ne 0) { Write-Error "scp failed"; exit 1 }

Write-Host "==> Installing into container ${ContainerName} on ${Server}..."
$cmd = "docker exec ${ContainerName} mkdir -p /home/node/.n8n/custom && docker cp /tmp/n8n-nodes-teckel-ethereum ${ContainerName}:/home/node/.n8n/custom/ && docker exec ${ContainerName} sh -c 'cd /home/node/.n8n && rm -rf node_modules/n8n-nodes-teckel-ethereum && npm install ./custom/n8n-nodes-teckel-ethereum --ignore-scripts' && docker restart ${ContainerName} && echo Done"
Invoke-Ssh $cmd
if ($LASTEXITCODE -ne 0) { Write-Error "Remote install failed"; exit 1 }

Write-Host "==> Deploy complete."
