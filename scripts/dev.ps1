$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $repoRoot "backend"
$frontendDir = Join-Path $repoRoot "frontend"
$backendPython = Join-Path $backendDir ".venv\Scripts\python.exe"

if (!(Test-Path $backendPython)) {
  Write-Error "Backend virtual environment not found. Run: npm run install:backend"
}

if (!(Test-Path (Join-Path $frontendDir "node_modules"))) {
  Write-Error "Frontend dependencies not found. Run: npm run install:frontend"
}

Write-Host "Starting backend on http://127.0.0.1:8000"
$backend = Start-Process `
  -FilePath $backendPython `
  -ArgumentList @("-m", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000") `
  -WorkingDirectory $backendDir `
  -PassThru `
  -WindowStyle Hidden

try {
  Write-Host "Starting frontend on http://localhost:3000"
  Push-Location $frontendDir
  npm.cmd run dev
}
finally {
  Pop-Location
  if ($backend -and !$backend.HasExited) {
    Stop-Process -Id $backend.Id -Force
  }
}
