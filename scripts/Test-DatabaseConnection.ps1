# PowerShell Test Database Connection and Validation Script for NarrativeMorph

# Define variables
$PG_HOST = "localhost"
$PG_PORT = "5432"
$PG_DATABASE = "narrative_morph"
$PG_USER = "raguser"
$PG_PASSWORD = "ragpass123"

# Function to run psql commands
function Invoke-Psql {
    param (
        [string]$Command
    )
    
    # Use docker exec to run psql in the container
    $output = docker exec narrative_postgres psql -U $PG_USER -d $PG_DATABASE -c "$Command" 2>&1
    return $output
}

# Colors for output
function Write-ColorOutput {
    param (
        [string]$Text,
        [string]$Color = "White"
    )
    
    Write-Host $Text -ForegroundColor $Color
}

Write-ColorOutput "===================================" "Yellow"
Write-ColorOutput "NarrativeMorph Database Connection Test" "Yellow"
Write-ColorOutput "===================================" "Yellow"

# Test connection
Write-ColorOutput "`nTesting database connection..." "Yellow"
try {
    $connection = Invoke-Psql "SELECT 1;"
    if ($connection -match "1 row") {
        Write-ColorOutput "✓ Database connection successful!" "Green"
    }
    else {
        Write-ColorOutput "✗ Failed to connect to database" "Red"
        Write-ColorOutput "  Check if PostgreSQL is running and credentials are correct" "Red"
        exit 1
    }
}
catch {
    Write-ColorOutput "✗ Error connecting to database: $_" "Red"
    exit 1
}

# Test if key tables exist
Write-ColorOutput "`nChecking if key tables exist..." "Yellow"
$tables = @("users", "projects", "scenes", "media_assets", "system_settings")
$all_tables_exist = $true

foreach ($table in $tables) {
    $table_exists = Invoke-Psql "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');"
    if ($table_exists -match "t") {
        Write-ColorOutput "✓ Table '$table' exists" "Green"
    }
    else {
        Write-ColorOutput "✗ Table '$table' does not exist" "Red"
        $all_tables_exist = $false
    }
}

if ($all_tables_exist) {
    Write-ColorOutput "`nAll required tables exist in the database!" "Green"
}
else {
    Write-ColorOutput "`nSome required tables are missing!" "Red"
    Write-ColorOutput "Please check your initialization scripts" "Red"
    exit 1
}

# Verify admin user
Write-ColorOutput "`nVerifying admin user exists..." "Yellow"
$admin_exists = Invoke-Psql "SELECT EXISTS (SELECT 1 FROM users WHERE username = 'admin');"
if ($admin_exists -match "t") {
    Write-ColorOutput "✓ Admin user exists" "Green"
    
    # Check admin permissions
    $is_superuser = Invoke-Psql "SELECT is_superuser FROM users WHERE username = 'admin';"
    if ($is_superuser -match "t") {
        Write-ColorOutput "✓ Admin has superuser permissions" "Green"
    }
    else {
        Write-ColorOutput "✗ Admin does not have superuser permissions" "Red"
    }
}
else {
    Write-ColorOutput "✗ Admin user does not exist" "Red"
}

# Check system settings
Write-ColorOutput "`nChecking system settings..." "Yellow"
$settings_exist = Invoke-Psql "SELECT EXISTS (SELECT 1 FROM system_settings WHERE key = 'video_generation_settings');"
if ($settings_exist -match "t") {
    Write-ColorOutput "✓ Video generation settings exist" "Green"
    
    # Display settings
    Write-ColorOutput "Current video settings:" "Yellow"
    Invoke-Psql "SELECT value::text FROM system_settings WHERE key = 'video_generation_settings';"
}
else {
    Write-ColorOutput "✗ Video generation settings do not exist" "Red"
}

# Test query execution & performance
Write-ColorOutput "`nTesting query performance..." "Yellow"
Invoke-Psql "EXPLAIN ANALYZE SELECT * FROM users WHERE username = 'admin';"

Write-ColorOutput "`nTesting join performance..." "Yellow"
Invoke-Psql @"
EXPLAIN ANALYZE
SELECT p.title, u.username, COUNT(s.*) as scene_count, COUNT(m.*) as media_count
FROM projects p
LEFT JOIN users u ON p.owner_id = u.id
LEFT JOIN scenes s ON s.project_id = p.id
LEFT JOIN media_assets m ON m.project_id = p.id
GROUP BY p.id, u.username
LIMIT 5;
"@

# Final status
Write-ColorOutput "`n===================================" "Yellow"
Write-ColorOutput "Database validation complete!" "Green"
Write-ColorOutput "===================================" "Yellow"

exit 0
