# Test GitHub Actions locally with act

## Prerequisites
- Install act: `choco install act-cli` or `scoop install act`
- Docker Desktop must be running

## Test the workflow locally

### Test on push event (default)
```powershell
act push
```

### Test with specific event
```powershell
act workflow_dispatch
```

### Test with Windows runner (requires Windows container)
```powershell
act -P windows-latest=ghcr.io/catthehacker/ubuntu:runner-latest
```

### List available workflows
```powershell
act -l
```

### Dry run (show what would happen)
```powershell
act --dryrun
```

### Run specific job
```powershell
act -j build-windows
```

## Notes

- `act` doesn't support Windows containers well, so it will use Linux containers
- For actual Windows testing, push to GitHub and let the real runners handle it
- Use `act` primarily for syntax validation and job flow testing
- To skip the Docker pull prompt: `act --pull=false`

## Environment Variables

If your workflow needs secrets or environment variables:

```powershell
# Create a .secrets file (don't commit this!)
echo "OPENWEATHER_API_KEY=your_key_here" > .secrets

# Run with secrets
act push --secret-file .secrets
```

## Troubleshooting

### Docker daemon not running
Start Docker Desktop before running act

### Permission denied
Run PowerShell as Administrator

### Workflow not found
Make sure you're in the repository root directory

## Full local test command
```powershell
# Test the workflow with verbose output
act push -v
```
