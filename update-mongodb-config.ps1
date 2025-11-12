# MongoDB Configuration Update Script
# This script updates MongoDB configuration in .env.local file

Write-Host "=== MongoDB Configuration Update Tool ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path .env.local)) {
    Write-Host "Warning: .env.local file does not exist, creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Copy-Item .env.example .env.local
        Write-Host "Success: Created .env.local file" -ForegroundColor Green
    } else {
        Write-Host "Error: .env.example file does not exist, please create .env.local manually" -ForegroundColor Red
        exit 1
    }
}

# Read current content
$envContent = Get-Content .env.local -Raw

# MongoDB configuration template
$mongodbConfigLines = @(
    "",
    "# MongoDB Configuration (for knowledge graph data and user authentication)",
    'MONGODB_URI="mongodb://admin:password@localhost:27017/growforever?authSource=admin"',
    "MONGO_USER=admin",
    "MONGO_PASSWORD=password",
    "MONGO_DB=growforever",
    "MONGO_PORT=27017"
)

# Check if MongoDB config already exists
if ($envContent -match "MONGODB_URI") {
    Write-Host "Found existing MongoDB configuration" -ForegroundColor Yellow
    
    # Ask if user wants to update
    $update = Read-Host "Do you want to update MongoDB configuration? (y/n)"
    if ($update -ne "y" -and $update -ne "Y") {
        Write-Host "Update cancelled" -ForegroundColor Yellow
        exit 0
    }
    
    # Remove old MongoDB configuration
    $lines = Get-Content .env.local
    $newLines = @()
    
    for ($i = 0; $i -lt $lines.Length; $i++) {
        $line = $lines[$i]
        
        if ($line -match "^# MongoDB" -or $line -match "^MONGODB_URI" -or $line -match "^MONGO_USER" -or $line -match "^MONGO_PASSWORD" -or $line -match "^MONGO_DB" -or $line -match "^MONGO_PORT") {
            continue
        }
        
        $newLines += $line
    }
    
    # Add new MongoDB configuration
    $newLines += $mongodbConfigLines
    
    $newLines | Set-Content .env.local
    Write-Host "Success: MongoDB configuration updated" -ForegroundColor Green
} else {
    Write-Host "No MongoDB configuration found, adding..." -ForegroundColor Yellow
    
    # Add configuration to end of file
    Add-Content .env.local ""
    Add-Content .env.local "# MongoDB Configuration (for knowledge graph data and user authentication)"
    Add-Content .env.local 'MONGODB_URI="mongodb://admin:password@localhost:27017/growforever?authSource=admin"'
    Add-Content .env.local "MONGO_USER=admin"
    Add-Content .env.local "MONGO_PASSWORD=password"
    Add-Content .env.local "MONGO_DB=growforever"
    Add-Content .env.local "MONGO_PORT=27017"
    
    Write-Host "Success: MongoDB configuration added" -ForegroundColor Green
}

Write-Host ""
Write-Host "Current MongoDB configuration:" -ForegroundColor Cyan
Get-Content .env.local | Select-String -Pattern "MONGO" | ForEach-Object {
    Write-Host "  $_" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Tips:" -ForegroundColor Yellow
Write-Host "  1. Please modify MongoDB configuration in .env.local according to your needs" -ForegroundColor Gray
Write-Host "  2. Make sure MongoDB container is running: docker-compose up -d mongodb" -ForegroundColor Gray
Write-Host "  3. Change default password and JWT_SECRET in production environment" -ForegroundColor Gray
Write-Host ""
