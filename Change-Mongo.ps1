$ErrorActionPreference='Stop'
$RootDir=Split-Path -Parent $PSScriptRoot
$MongoFile=Join-Path $RootDir 'config\mongodb-uri.txt'
Write-Host 'Paste the NEW MongoDB Atlas connection string.' -ForegroundColor Yellow
$uri=Read-Host 'MongoDB connection string'
if([string]::IsNullOrWhiteSpace($uri)){Write-Host 'Nothing changed.' -ForegroundColor Yellow;Start-Sleep 2;exit}
if(-not ($uri.StartsWith('mongodb://') -or $uri.StartsWith('mongodb+srv://'))){Write-Host 'Invalid MongoDB connection string.' -ForegroundColor Red;Read-Host 'Press ENTER';exit 1}
[System.IO.File]::WriteAllText($MongoFile,$uri.Trim(),[System.Text.Encoding]::UTF8)
Write-Host 'Connection string changed. Now run RUN_UNIPULSE_WINDOWS.bat.' -ForegroundColor Green
Start-Sleep 3
