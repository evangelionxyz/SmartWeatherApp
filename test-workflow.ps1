# Local test script for Windows Build workflow
# This script mimics the GitHub Actions workflow steps locally

param(
    [switch]$SkipClean,
    [switch]$SkipWeb,
    [switch]$SkipBuild,
    [switch]$UseAct,
    [string]$BuildType = "Release"
)

$ErrorActionPreference = "Stop"

Write-Host "=== ForePlan Windows Build Test ===" -ForegroundColor Cyan
Write-Host "Build Type: $BuildType" -ForegroundColor Yellow
Write-Host ""

function Test-Command {
    param([string]$Command)
    return Get-Command $Command -ErrorAction SilentlyContinue
}

function Write-Step {
    param([string]$Message)
    Write-Host "Step: $Message" -ForegroundColor Green
}

function Write-Error-Exit {
    param([string]$Message)
    Write-Host "Error: $Message" -ForegroundColor Red
    exit 1
}

# If UseAct flag is set, run with act instead
if ($UseAct) {
    Write-Host "Running with act (GitHub Actions local runner)..." -ForegroundColor Cyan
    
    # Check if act is installed
    if (-not (Test-Command "act")) {
        Write-Error-Exit "act is not installed! Install with: choco install act-cli"
    }

    # Check if Docker is running
    try {
        docker ps 2>&1 | Out-Null
        if (-not $?) { throw }
    } catch {
        Write-Error-Exit "Docker is not running! Please start Docker Desktop"
    }

    Write-Host "Running Windows Build workflow with act..." -ForegroundColor Yellow
    Write-Host "Note: act uses Linux containers, so this simulates the workflow structure only" -ForegroundColor Yellow
    Write-Host ""
    
    # List available workflows
    Write-Host "Available workflows:" -ForegroundColor Cyan
    act -l
    
    Write-Host ""
    Write-Host "Running workflow..." -ForegroundColor Cyan
    act push -W .github/workflows/windows-build.yml
    
    exit $LASTEXITCODE
}

# Local build test (mimics the actual workflow steps)
Write-Host "Running local build test..." -ForegroundColor Yellow
Write-Host ""

# Step 1: Check prerequisites
Write-Step "Checking prerequisites"

# Check Node.js
if (-not (Test-Command "node")) {
    Write-Error-Exit "Node.js not found! Please install Node.js 20+"
}
$nodeVersion = node --version
Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green

# Check npm
if (-not (Test-Command "npm")) {
    Write-Error-Exit "npm not found!"
}
$npmVersion = npm --version
Write-Host "✓ npm: $npmVersion" -ForegroundColor Green

# Check CMake
if (-not (Test-Command "cmake")) {
    Write-Error-Exit "CMake not found! Please install CMake"
}
$cmakeVersion = cmake --version | Select-Object -First 1
Write-Host "✓ CMake: $cmakeVersion" -ForegroundColor Green

# Check Visual Studio Build Tools
$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (Test-Path $vswhere) {
    $vsInstance = & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property displayName
    if ($vsInstance) {
        Write-Host "✓ Visual Studio: $vsInstance" -ForegroundColor Green
    } else {
        Write-Error-Exit "Visual Studio Build Tools not found!"
    }
} else {
    Write-Host "⚠ Warning: Cannot verify Visual Studio installation" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Clean previous build (optional)
if (-not $SkipClean -and (Test-Path "build")) {
    Write-Step "Cleaning previous build"
    Remove-Item -Path "build" -Recurse -Force
    Write-Host "✓ Cleaned build directory" -ForegroundColor Green
    Write-Host ""
}

# Step 3: Build web application
if (-not $SkipWeb) {
    Write-Step "Building web application"
    
    if (-not (Test-Path "foreplan/web/package.json")) {
        Write-Error-Exit "package.json not found in foreplan/web/"
    }
    
    Push-Location "foreplan/web"
    try {
        Write-Host "Installing web dependencies..."
        npm ci
        if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }
        
        Write-Host "Building web application..."
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
        
        if (-not (Test-Path "dist")) {
            throw "dist directory not created"
        }
        
        Write-Host "✓ Web build completed" -ForegroundColor Green
    } catch {
        Write-Error-Exit "Web build failed: $_"
    } finally {
        Pop-Location
    }
    Write-Host ""
}

# Step 4: Configure CMake
if (-not $SkipBuild) {
    Write-Step "Configuring CMake"
    
    $cmakeArgs = @(
        "-B", "build",
        "-S", ".",
        "-G", "Visual Studio 17 2022",
        "-A", "x64",
        "-DCMAKE_BUILD_TYPE=$BuildType",
        "-DFOREPLAN_BUILD_WEB=ON"
    )
    
    Write-Host "Running: cmake $($cmakeArgs -join ' ')"
    & cmake @cmakeArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Exit "CMake configuration failed"
    }
    Write-Host "✓ CMake configured" -ForegroundColor Green
    Write-Host ""
    
    # Step 5: Build C++ application
    Write-Step "Building C++ application"
    
    cmake --build build --config $BuildType --parallel
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Exit "C++ build failed"
    }
    Write-Host "✓ C++ build completed" -ForegroundColor Green
    Write-Host ""
    
    # Step 6: Copy web dist to build output
    Write-Step "Copying web assets"
    
    $webOutputDir = "build\bin\$BuildType\web"
    if (-not (Test-Path $webOutputDir)) {
        New-Item -ItemType Directory -Force -Path $webOutputDir | Out-Null
    }
    
    if (Test-Path "foreplan\web\dist") {
        Copy-Item -Path "foreplan\web\dist" -Destination "$webOutputDir\dist" -Recurse -Force
        Write-Host "✓ Web assets copied to: $webOutputDir\dist" -ForegroundColor Green
    } else {
        Write-Host "⚠ Warning: Web dist not found, skipping copy" -ForegroundColor Yellow
    }
    Write-Host ""
    
    # Step 7: Test executable
    Write-Step "Testing executable"
    
    $exePath = "build\bin\$BuildType\ForePlan.exe"
    if (Test-Path $exePath) {
        Write-Host "✓ ForePlan.exe found at: $exePath" -ForegroundColor Green
        
        # Get file info
        $fileInfo = Get-Item $exePath
        Write-Host "  Size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Gray
        Write-Host "  Modified: $($fileInfo.LastWriteTime)" -ForegroundColor Gray
    } else {
        Write-Error-Exit "ForePlan.exe not found at: $exePath"
    }
}

Write-Host ""
Write-Host "=== Build Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Usage examples:" -ForegroundColor Yellow
Write-Host "  .\test-workflow.ps1                    # Full build test" -ForegroundColor White
Write-Host "  .\test-workflow.ps1 -SkipClean         # Skip cleaning build dir" -ForegroundColor White
Write-Host "  .\test-workflow.ps1 -SkipWeb           # Skip web build" -ForegroundColor White
Write-Host "  .\test-workflow.ps1 -SkipBuild         # Skip C++ build" -ForegroundColor White
Write-Host "  .\test-workflow.ps1 -UseAct            # Use act for GitHub Actions simulation" -ForegroundColor White
Write-Host "  .\test-workflow.ps1 -BuildType Debug   # Build in Debug mode" -ForegroundColor White
Write-Host ""
Write-Host "For full Windows workflow testing on GitHub, push to repository" -ForegroundColor Green
