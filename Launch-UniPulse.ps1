$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$RootDir = Split-Path -Parent $PSScriptRoot
$AppDir = Join-Path $RootDir 'app'
$RuntimeDir = Join-Path $RootDir '_runtime'
$CacheDir = Join-Path $RootDir '_cache'
$ConfigDir = Join-Path $RootDir 'config'
$LogsDir = Join-Path $RootDir 'logs'
$MongoFile = Join-Path $ConfigDir 'mongodb-uri.txt'
$SecretFile = Join-Path $ConfigDir 'jwt-secret.txt'
$PidFile = Join-Path $RootDir '.unipulse.pid'
$NodeVersion = '22.14.0'
$NodePrimary = "https://nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-win-x64.zip"
$NodeFallback = "https://r2.nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-win-x64.zip"

function Step([string]$Text) { Write-Host "[UniPulse] $Text" -ForegroundColor Cyan }
function Fail([string]$Text) { throw $Text }

function Download-File([string]$Primary,[string]$Fallback,[string]$OutFile) {
    New-Item -ItemType Directory -Force -Path (Split-Path $OutFile -Parent) | Out-Null
    try {
        Invoke-WebRequest -UseBasicParsing -Uri $Primary -OutFile $OutFile -TimeoutSec 120
    } catch {
        Write-Host "Primary download failed; trying alternate Node.js host..." -ForegroundColor Yellow
        Invoke-WebRequest -UseBasicParsing -Uri $Fallback -OutFile $OutFile -TimeoutSec 120
    }
}

function Find-ExistingNode {
    $cmd = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    $local = Join-Path $RuntimeDir 'node\node.exe'
    if (Test-Path $local) { return $local }

    # Reuse portable Node from an older UniPulse folder if one is beside this folder.
    $parent = Split-Path $RootDir -Parent
    try {
        foreach ($folder in (Get-ChildItem -Path $parent -Directory -Filter 'UniPulse*' -ErrorAction SilentlyContinue)) {
            $candidate = Join-Path $folder.FullName '_runtime\node\node.exe'
            if (Test-Path $candidate) { return $candidate }
        }
    } catch {}
    return $null
}

function Ensure-Node {
    $existing = Find-ExistingNode
    if ($existing) {
        Step "Using Node.js: $existing"
        return $existing
    }

    $nodeDir = Join-Path $RuntimeDir 'node'
    $nodeExe = Join-Path $nodeDir 'node.exe'
    $zip = Join-Path $CacheDir "node-v$NodeVersion-win-x64.zip"
    Step 'Node.js was not found. Downloading one portable Windows runtime (no installation)...'
    if (-not (Test-Path $zip)) { Download-File $NodePrimary $NodeFallback $zip }

    $extract = Join-Path $RuntimeDir 'node_extract'
    if (Test-Path $extract) { Remove-Item -Recurse -Force $extract }
    if (Test-Path $nodeDir) { Remove-Item -Recurse -Force $nodeDir }
    New-Item -ItemType Directory -Force -Path $extract | Out-Null
    Expand-Archive -Path $zip -DestinationPath $extract -Force
    $inner = Get-ChildItem $extract -Directory | Select-Object -First 1
    if (-not $inner) { Fail 'Could not extract portable Node.js.' }
    Move-Item $inner.FullName $nodeDir
    Remove-Item -Recurse -Force $extract
    if (-not (Test-Path $nodeExe)) { Fail 'Portable Node.js is incomplete.' }
    return $nodeExe
}

function Ensure-Connection {
    New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null
    if (Test-Path $MongoFile) {
        $saved = [System.IO.File]::ReadAllText($MongoFile).Trim()
        if (-not [string]::IsNullOrWhiteSpace($saved)) { return $saved }
    }

    Write-Host ''
    Write-Host 'Paste your MongoDB Atlas connection string below.' -ForegroundColor Yellow
    Write-Host 'Example: mongodb+srv://username:password@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority' -ForegroundColor DarkGray
    $uri = Read-Host 'MongoDB connection string'
    if ([string]::IsNullOrWhiteSpace($uri)) { Fail 'No MongoDB connection string was entered.' }
    if (-not ($uri.StartsWith('mongodb://') -or $uri.StartsWith('mongodb+srv://'))) {
        Fail 'The connection string must start with mongodb:// or mongodb+srv://'
    }
    [System.IO.File]::WriteAllText($MongoFile, $uri.Trim(), [System.Text.Encoding]::UTF8)
    Write-Host 'Connection string saved locally. Next time you can just double-click RUN_UNIPULSE_WINDOWS.bat.' -ForegroundColor Green
    return $uri.Trim()
}

function Ensure-Secret {
    if (Test-Path $SecretFile) {
        $s = [System.IO.File]::ReadAllText($SecretFile).Trim()
        if ($s) { return $s }
    }
    $secret = ([guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N'))
    [System.IO.File]::WriteAllText($SecretFile, $secret, [System.Text.Encoding]::ASCII)
    return $secret
}

function Ensure-Packages([string]$NodeExe) {
    if (Test-Path (Join-Path $AppDir 'node_modules\mongoose\package.json')) {
        Step 'App packages are ready.'
        return
    }
    $nodeDir = Split-Path $NodeExe -Parent
    $npm = Join-Path $nodeDir 'npm.cmd'
    if (-not (Test-Path $npm)) {
        $npmCmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
        if ($npmCmd) { $npm = $npmCmd.Source }
    }
    if (-not (Test-Path $npm)) { Fail 'npm was not found. Please install Node.js once, then run UniPulse again.' }

    Step 'First run only: downloading the small UniPulse server packages...'
    Push-Location $AppDir
    try {
        & $npm install --omit=dev --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { Fail 'npm package download failed. Check internet connection and run again.' }
    } finally { Pop-Location }
}

function Stop-OldServer {
    if (Test-Path $PidFile) {
        try {
            $oldPid = [int]([System.IO.File]::ReadAllText($PidFile).Trim())
            if ($oldPid -gt 0) { Stop-Process -Id $oldPid -Force -ErrorAction SilentlyContinue }
        } catch {}
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
    }
}

function Start-AppWindow {
    $url = 'http://127.0.0.1:5000'
    $edgeCandidates = @(
        (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'),
        (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe')
    ) | Where-Object { $_ -and (Test-Path $_) }

    $edge = $edgeCandidates | Select-Object -First 1
    if (-not $edge) {
        $edgeCmd = Get-Command msedge.exe -ErrorAction SilentlyContinue
        if ($edgeCmd) { $edge = $edgeCmd.Source }
    }

    if ($edge) {
        Start-Process -FilePath $edge -ArgumentList @("--app=$url", '--window-size=470,920', '--new-window') | Out-Null
    } else {
        Start-Process $url | Out-Null
    }
}

try {
    Clear-Host
    Write-Host '============================================================' -ForegroundColor DarkCyan
    Write-Host '                 UniPulse for Windows' -ForegroundColor Cyan
    Write-Host '============================================================' -ForegroundColor DarkCyan
    Write-Host 'No Flutter. No Android SDK. No Java. No APK.' -ForegroundColor Green
    Write-Host 'First run: paste MongoDB Atlas connection string. That is all.' -ForegroundColor Green
    Write-Host ''

    $mongoUri = Ensure-Connection
    $nodeExe = Ensure-Node
    Ensure-Packages $nodeExe
    $secret = Ensure-Secret
    Stop-OldServer

    $env:MONGODB_URI = $mongoUri
    $env:MONGODB_DB = 'unipulse_app'
    $env:JWT_SECRET = $secret
    $env:PORT = '5000'

    New-Item -ItemType Directory -Force -Path $LogsDir | Out-Null
    $outLog = Join-Path $LogsDir 'unipulse-out.log'
    $errLog = Join-Path $LogsDir 'unipulse-error.log'
    Remove-Item $outLog,$errLog -Force -ErrorAction SilentlyContinue

    Step 'Connecting UniPulse to MongoDB Atlas...'
    $proc = Start-Process -FilePath $nodeExe -ArgumentList @('server.js') -WorkingDirectory $AppDir -WindowStyle Hidden -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru
    [System.IO.File]::WriteAllText($PidFile, [string]$proc.Id, [System.Text.Encoding]::ASCII)

    $ready = $false
    for ($i=0; $i -lt 35; $i++) {
        Start-Sleep -Seconds 1
        if ($proc.HasExited) { break }
        try {
            $r = Invoke-RestMethod -Uri 'http://127.0.0.1:5000/health' -TimeoutSec 2
            if ($r.ok) { $ready = $true; break }
        } catch {}
    }

    if (-not $ready) {
        Write-Host ''
        Write-Host 'UniPulse could not connect to MongoDB Atlas.' -ForegroundColor Red
        if (Test-Path $errLog) {
            Write-Host '---- ERROR DETAILS ----' -ForegroundColor Yellow
            Get-Content $errLog | Select-Object -Last 25
        }
        Write-Host ''
        Write-Host 'Most common fix:' -ForegroundColor Yellow
        Write-Host 'MongoDB Atlas > Security > Network Access > Add Current IP Address' -ForegroundColor White
        Write-Host 'Also check the database username/password in your connection string.' -ForegroundColor White
        Fail 'Database connection failed.'
    }

    Write-Host ''
    Write-Host 'SUCCESS: UniPulse is connected and ready.' -ForegroundColor Green
    Write-Host 'Opening the Windows app...' -ForegroundColor Green
    Start-AppWindow
    Write-Host ''
    Write-Host 'You can close this black window now.' -ForegroundColor DarkGray
    Write-Host 'To stop the UniPulse server later, double-click STOP_UNIPULSE.bat.' -ForegroundColor DarkGray
    Start-Sleep -Seconds 3
    exit 0
} catch {
    Write-Host ''
    Write-Host ('ERROR: ' + $_.Exception.Message) -ForegroundColor Red
    Write-Host ''
    Read-Host 'Press ENTER to close'
    exit 1
}
