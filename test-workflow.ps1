# Quick test script for GitHub Actions workflow
# Run this to test the workflow locally with act

Write-Host "Testing GitHub Actions Workflow Locally" -ForegroundColor Cyan
Write-Host ""

# Check if act is installed
if (-not (Get-Command act -ErrorAction SilentlyContinue)) {
    Write-Host "act is not installed!" -ForegroundColor Red
    Write-Host "Install with: choco install act-cli" -ForegroundColor Yellow
    Write-Host "Or download from: https://github.com/nektos/act" -ForegroundColor Yellow
    exit 1
}

Write-Host "act is installed" -ForegroundColor Green

# Check if Docker is running
$dockerRunning = $false
try {
    docker ps 2>&1 | Out-Null
    $dockerRunning = $?
} catch {
    $dockerRunning = $false
}

if (-not $dockerRunning) {
    Write-Host "Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host "Docker is running" -ForegroundColor Green
Write-Host ""

# List available workflows
Write-Host "Available workflows:" -ForegroundColor Cyan
act -l

Write-Host ""
Write-Host "Running workflow test..." -ForegroundColor Cyan
Write-Host ""

# Test the workflow
# Note: act doesn't fully support Windows containers, so this will use Ubuntu
# For full Windows testing, push to GitHub
act push --dryrun

Write-Host ""
Write-Host "To run the actual workflow:" -ForegroundColor Yellow
Write-Host "   act push" -ForegroundColor White
Write-Host ""
Write-Host "For full Windows build, push to GitHub - act uses Linux containers" -ForegroundColor Yellow
