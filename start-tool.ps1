$ErrorActionPreference = 'Stop'
$toolPort = if ($env:PORT) { [int]$env:PORT } else { 3000 }
$toolUrl = "http://localhost:$toolPort"
$privatePort = if ($env:VC_ADMIN_PORT) { [int]$env:VC_ADMIN_PORT } else { 3891 }
$nodeCommand = Get-Command node -ErrorAction Stop
if ([int](& $nodeCommand.Source -p 'parseInt(process.versions.node)') -lt 24) { throw 'Cần Node.js 24 trở lên.' }
$taskData = if ($env:VC_DATA_DIR) { $env:VC_DATA_DIR } else { Join-Path $env:LOCALAPPDATA '2TECHMN\Mnhut_2tech_Al' }
New-Item -ItemType Directory -Force -Path $taskData | Out-Null
$running = $false
try { $health = Invoke-RestMethod "$toolUrl/api/health" -TimeoutSec 2; $running = $health.company -eq '2TECH MN' } catch {}
if (-not $running) {
  $serverPath = Join-Path $PSScriptRoot 'server.js'
  Start-Process -FilePath $nodeCommand.Source -ArgumentList ('"' + $serverPath + '"') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskData 'gateway.stdout.log') -RedirectStandardError (Join-Path $taskData 'gateway.stderr.log') | Out-Null
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 300
    try { $health = Invoke-RestMethod "$toolUrl/api/health" -TimeoutSec 2; $running = $health.company -eq '2TECH MN'; if ($running) { break } } catch {}
  }
}
if (-not $running) { throw "Tool chưa khởi động. Kiểm tra nhật ký tại $taskData và cổng $toolPort." }
Write-Host "Tool: $toolUrl | Admin riêng: http://localhost:$privatePort"
Write-Host "Mật khẩu quản trị ban đầu nằm tại: $(Join-Path $taskData 'admin-password.txt')"
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (Test-Path $edge) {
  Start-Process -FilePath $edge -ArgumentList "--app=$toolUrl"
} elseif (Test-Path $chrome) {
  Start-Process -FilePath $chrome -ArgumentList "--app=$toolUrl"
} else {
  Start-Process $toolUrl
}
