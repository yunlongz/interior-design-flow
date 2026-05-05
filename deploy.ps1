#Requires -Version 5.1
<#
.SYNOPSIS
    Deploy idf stack via Portainer API (using curl.exe).

.DESCRIPTION
    Reads $env:PORTAINER_TOKEN, auto-deletes old containers/images, then triggers Pull & Redeploy.
    Uses curl.exe instead of Invoke-RestMethod to avoid TLS/Schannel issues in PowerShell.

.EXAMPLE
    $env:PORTAINER_TOKEN = "ptr_xxx"
    .\deploy.ps1
#>

param(
    [string]$StackName = "idf",
    [string]$PortainerUrl = "https://192.168.131.32:9443",
    [int]$PollInterval = 5,
    [int]$MaxPollAttempts = 30
)

# --- 1. Check token ---
$token = $env:PORTAINER_TOKEN
if (-not $token) {
    Write-Host "[ERROR] PORTAINER_TOKEN env var not set" -ForegroundColor Red
    Write-Host "Run first: `$env:PORTAINER_TOKEN = 'your-token'" -ForegroundColor Yellow
    exit 1
}

# Verify curl.exe exists
$curl = Get-Command curl.exe -ErrorAction SilentlyContinue
if (-not $curl) {
    Write-Host "[ERROR] curl.exe not found. Please install curl or add it to PATH." -ForegroundColor Red
    exit 1
}

$baseUrl = "$PortainerUrl/api"
$hdr = "X-API-Key: $token"

# Helper: call API via curl.exe, return parsed JSON object
function Invoke-Api($method, $path, $bodyJson) {
    $url = "$baseUrl$path"
    $argsList = @('-k', '-s', '-H', $hdr, '-H', 'Content-Type: application/json')
    if ($method -ne 'GET') {
        $argsList += '-X', $method
    }
    if ($bodyJson) {
        $argsList += '-d', $bodyJson
    }
    $raw = & curl.exe @argsList $url 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "curl exit code $LASTEXITCODE"
    }
    if (-not $raw) { return $null }
    try { return $raw | ConvertFrom-Json } catch { return $raw }
}

# --- 2. Find stack ---
Write-Host "[1/5] Finding stack '$StackName'..." -ForegroundColor Cyan
try {
    $stacks = Invoke-Api 'GET' '/stacks'
} catch {
    Write-Host "[ERROR] Cannot connect to Portainer: $_" -ForegroundColor Red
    exit 1
}

$stack = $stacks | Where-Object { $_.Name -eq $StackName }
if (-not $stack) {
    Write-Host "[ERROR] Stack '$StackName' not found" -ForegroundColor Red
    Write-Host "Available: $($stacks.Name -join ', ')" -ForegroundColor Yellow
    exit 1
}

$endpointId = $stack.EndpointId
Write-Host "        Found: $StackName (ID=$($stack.Id), Endpoint=$endpointId)" -ForegroundColor Green

# --- 3. Delete old containers & images ---
Write-Host "[2/5] Cleaning old containers & images..." -ForegroundColor Cyan

# Delete containers
try {
    $containers = Invoke-Api 'GET' "/endpoints/$endpointId/docker/containers/json?all=true"
    $targetContainers = $containers | Where-Object { $_.Names | ForEach-Object { $_ -match 'idf-(backend|frontend)' } }
    foreach ($c in $targetContainers) {
        $name = ($c.Names[0] -replace '^/', '')
        try {
            if ($c.State -eq "running") {
                Invoke-Api 'POST' "/endpoints/$endpointId/docker/containers/$($c.Id)/stop" | Out-Null
                Write-Host "        Stopped $name" -ForegroundColor Gray
            }
            Invoke-Api 'DELETE' "/endpoints/$endpointId/docker/containers/$($c.Id)?force=true" | Out-Null
            Write-Host "        Deleted container $name" -ForegroundColor Gray
        } catch {
            Write-Host "        [WARN] Failed to delete container $name : $_" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "        [WARN] Container cleanup failed: $_" -ForegroundColor Yellow
}

# Delete images
try {
    $images = Invoke-Api 'GET' "/endpoints/$endpointId/docker/images/json"
    $targetImages = $images | Where-Object { $_.RepoTags -and ($_.RepoTags | ForEach-Object { $_ -match 'idf-(backend|frontend)' }) }
    foreach ($img in $targetImages) {
        $tag = $img.RepoTags[0]
        try {
            Invoke-Api 'DELETE' "/endpoints/$endpointId/docker/images/$($img.Id)?force=true" | Out-Null
            Write-Host "        Deleted image $tag" -ForegroundColor Gray
        } catch {
            Write-Host "        [WARN] Failed to delete image $tag : $_" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "        [WARN] Image cleanup failed: $_" -ForegroundColor Yellow
}

# --- 4. Trigger redeploy ---
Write-Host "[3/5] Triggering git redeploy..." -ForegroundColor Cyan
$body = (@{
    env                     = @()
    prune                   = $false
    pullImage               = $true
    repositoryReferenceName = "refs/heads/main"
} | ConvertTo-Json)

try {
    Invoke-Api 'POST' "/stacks/$($stack.Id)/git/redeploy" $body | Out-Null
    Write-Host "        Redeploy triggered" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Redeploy failed: $_" -ForegroundColor Red
    exit 1
}

# --- 5. Poll container status ---
Write-Host "[4/5] Waiting for containers... (interval=${PollInterval}s, max=$MaxPollAttempts)" -ForegroundColor Cyan

for ($i = 1; $i -le $MaxPollAttempts; $i++) {
    Start-Sleep -Seconds $PollInterval

    try {
        $containers = Invoke-Api 'GET' "/endpoints/$endpointId/docker/containers/json?all=true"
        $idfContainers = $containers | Where-Object { $_.Names | ForEach-Object { $_ -like "*idf*" } }

        $running = @($idfContainers | Where-Object { $_.State -eq "running" })
        $total = $idfContainers.Count
        $runCount = $running.Count

        if ($total -eq 0) {
            Write-Host "        [$i/$MaxPollAttempts] No containers yet, waiting..." -ForegroundColor Yellow
            continue
        }

        if ($runCount -eq $total) {
            Write-Host "        [$i/$MaxPollAttempts] All $total containers running" -ForegroundColor Green
            foreach ($c in $running) {
                $name = ($c.Names[0] -replace '^/', '')
                Write-Host "              OK  $name  ($($c.Status))" -ForegroundColor Gray
            }
            Write-Host "[5/5] Deploy complete! Visit http://192.168.131.32" -ForegroundColor Green
            exit 0
        }

        $notRunning = $idfContainers | Where-Object { $_.State -ne "running" }
        Write-Host "        [$i/$MaxPollAttempts] $runCount/$total running..." -ForegroundColor Yellow
        foreach ($c in $notRunning) {
            $name = ($c.Names[0] -replace '^/', '')
            Write-Host "              ..  $name  ($($c.State))" -ForegroundColor Gray
        }
    } catch {
        Write-Host "        [$i/$MaxPollAttempts] Poll failed: $_" -ForegroundColor Red
    }
}

Write-Host "[WARN] Timeout. Containers may still be starting. Check Portainer manually." -ForegroundColor Yellow
