# CI/CD Setup for SmartWeatherApp

This repository includes GitHub Actions workflows for automated building and testing.

## Workflows

### Windows Build (`windows-build.yml`)

Automatically builds the Windows version of SmartWeatherApp on:
- Push to `master`, `main`, or `dev` branches
- Pull requests to `master` or `main`
- Manual workflow dispatch

**What it does:**
1. Checks out the code
2. Sets up Node.js and builds the React frontend
3. Configures and builds the C++ application with CMake and MSVC
4. Packages the application with all dependencies
5. Uploads the build artifact
6. Creates a GitHub Release (if triggered by a tag)

## Testing Locally with `act`

You can test GitHub Actions workflows locally before pushing to GitHub.

### Prerequisites

1. Install Docker Desktop and make sure it's running
2. Install `act`:
   ```powershell
   choco install act-cli
   # or
   scoop install act
   ```

### Quick Test

```powershell
# Run the test script
.\test-workflow.ps1

# Or manually:
act push --dryrun
```

### Run Full Workflow

```powershell
# Test the push event
act push

# Test specific job
act -j build-windows

# Test with secrets
echo "OPENWEATHER_API_KEY=your_key_here" > .secrets
act push --secret-file .secrets
```

### Important Notes

- `act` uses Linux containers by default (Windows containers aren't well supported)
- For true Windows build testing, push to GitHub
- Use `act` mainly for workflow syntax validation and job flow testing

## Creating a Release

To create a release build:

1. Tag your commit:
   ```powershell
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. GitHub Actions will automatically:
   - Build the application
   - Create a GitHub Release
   - Attach the build artifacts

## Build Artifacts

After a successful build, you can download:
- `SmartWeatherApp-Windows-x64.zip` - Complete application package including:
  - SmartWeatherApp.exe
  - Frontend dist folder
  - Required DLLs
  - README.txt with setup instructions

## Environment Variables

The application requires:
- `OPENWEATHER_API_KEY` - Your OpenWeather API key

Set it in Windows:
```powershell
setx OPENWEATHER_API_KEY "your_api_key_here"
```

## Troubleshooting

### Workflow fails on frontend build
- Check that `package-lock.json` is committed
- Verify Node.js version compatibility

### CMake configuration fails
- Ensure all Git submodules are initialized
- Check CMakeLists.txt for syntax errors

### Build artifacts missing files
- Verify the `Package artifacts` step in the workflow
- Check that frontend dist was built successfully

### act doesn't work
- Ensure Docker Desktop is running
- Try: `docker ps` to verify Docker is accessible
- Update act: `choco upgrade act-cli`

## File Structure

```
.github/
├── workflows/
│   └── windows-build.yml    # Main Windows CI/CD workflow
├── ACT_TESTING.md           # Detailed act testing guide
.actrc                       # act configuration
.secrets                     # Local secrets (not committed)
test-workflow.ps1           # Quick test script
```

## Future Enhancements

- [ ] Linux build workflow
- [ ] macOS build workflow
- [ ] Code signing for Windows builds
- [ ] Automated testing
- [ ] Version number automation
