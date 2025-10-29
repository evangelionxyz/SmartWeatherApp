# Run GitHub Actions workflow locally with act
# This performs a full run (not dry-run)

param(
    [switch]$DryRun,
    [switch]$Verbose,
    [string]$Job = "build-windows"
)

Write-Host "GitHub Actions Local Runner" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
$errors = @()

if (-not (Get-Command act -ErrorAction SilentlyContinue)) {
    $errors += "act is not installed. Install with: choco install act-cli"
}

try {
    docker ps 2>&1 | Out-Null
    if (-not $?) { $errors += "Docker is not running. Please start Docker Desktop" }
} catch {
    $errors += "Docker is not running. Please start Docker Desktop"
}

if ($errors.Count -gt 0) {
    foreach ($error in $errors) {
        Write-Host $error -ForegroundColor Red
    }
    exit 1
}

Write-Host "Prerequisites OK" -ForegroundColor Green
Write-Host ""

# Build command
$actArgs = @("push")

if ($DryRun) {
    $actArgs += "--dryrun"
    Write-Host "Running in DRY-RUN mode (no actual execution)" -ForegroundColor Yellow
} else {
    Write-Host "Running FULL workflow (this may take a while)" -ForegroundColor Yellow
}

if ($Verbose) {
    $actArgs += "--verbose"
}

if ($Job) {
    $actArgs += "-j", $Job
}

Write-Host ""
Write-Host "Command: act $($actArgs -join ' ')" -ForegroundColor Cyan
Write-Host ""

# Run act
& act @actArgs

$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "Workflow completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Workflow failed with exit code: $exitCode" -ForegroundColor Red
}

exit $exitCode
