$ErrorActionPreference='SilentlyContinue'
$RootDir=Split-Path -Parent $PSScriptRoot
$PidFile=Join-Path $RootDir '.unipulse.pid'
if(Test-Path $PidFile){
  $id=[int]([System.IO.File]::ReadAllText($PidFile).Trim())
  Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
  Write-Host 'UniPulse server stopped.' -ForegroundColor Green
}else{
  Write-Host 'UniPulse server is not running.' -ForegroundColor Yellow
}
Start-Sleep -Seconds 2
