#!/bin/bash
# filepath: c:\Users\arman\Desktop\KAIROS\NarrativeMorph\scripts\test-database-connection.sh
# Test Database Connection and Validation Script for NarrativeMorph

# Set environment variables
export PGHOST=localhost
export PGPORT=5432
export PGDATABASE=narrative_morph
export PGUSER=raguser
export PGPASSWORD=ragpass123

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===================================${NC}"
echo -e "${YELLOW}NarrativeMorph Database Connection Test${NC}"
echo -e "${YELLOW}===================================${NC}"

# Test connection
echo -e "\n${YELLOW}Testing database connection...${NC}"
if psql -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful!${NC}"
else
    echo -e "${RED}✗ Failed to connect to database${NC}"
    echo -e "${RED}  Check if PostgreSQL is running and credentials are correct${NC}"
    exit 1
fi

# Test if key tables exist
echo -e "\n${YELLOW}Checking if key tables exist...${NC}"
tables=("users" "projects" "scenes" "media_assets" "system_settings")
all_tables_exist=true

for table in "${tables[@]}"; do
    if psql -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');" -t | grep -q 't'; then
        echo -e "${GREEN}✓ Table '$table' exists${NC}"
    else
        echo -e "${RED}✗ Table '$table' does not exist${NC}"
        all_tables_exist=false
    fi
done

if [ "$all_tables_exist" = true ]; then
    echo -e "\n${GREEN}All required tables exist in the database!${NC}"
else
    echo -e "\n${RED}Some required tables are missing!${NC}"
    echo -e "${RED}Please check your initialization scripts${NC}"
    exit 1
fi

# Verify admin user
echo -e "\n${YELLOW}Verifying admin user exists...${NC}"
if psql -c "SELECT EXISTS (SELECT 1 FROM users WHERE username = 'admin');" -t | grep -q 't'; then
    echo -e "${GREEN}✓ Admin user exists${NC}"
    
    # Check admin permissions
    if psql -c "SELECT is_superuser FROM users WHERE username = 'admin';" -t | grep -q 't'; then
        echo -e "${GREEN}✓ Admin has superuser permissions${NC}"
    else
        echo -e "${RED}✗ Admin does not have superuser permissions${NC}"
    fi
else
    echo -e "${RED}✗ Admin user does not exist${NC}"
fi

# Check system settings
echo -e "\n${YELLOW}Checking system settings...${NC}"
if psql -c "SELECT EXISTS (SELECT 1 FROM system_settings WHERE key = 'video_generation_settings');" -t | grep -q 't'; then
    echo -e "${GREEN}✓ Video generation settings exist${NC}"
    
    # Display settings
    echo -e "${YELLOW}Current video settings:${NC}"
    psql -c "SELECT value::text FROM system_settings WHERE key = 'video_generation_settings';" -t
else
    echo -e "${RED}✗ Video generation settings do not exist${NC}"
fi

# Test query execution & performance
echo -e "\n${YELLOW}Testing query performance...${NC}"
psql -c "EXPLAIN ANALYZE SELECT * FROM users WHERE username = 'admin';"

echo -e "\n${YELLOW}Testing join performance...${NC}"
psql -c "
EXPLAIN ANALYZE
SELECT p.title, u.username, COUNT(s.*) as scene_count, COUNT(m.*) as media_count
FROM projects p
LEFT JOIN users u ON p.owner_id = u.id
LEFT JOIN scenes s ON s.project_id = p.id
LEFT JOIN media_assets m ON m.project_id = p.id
GROUP BY p.id, u.username
LIMIT 5;
"

# Final status
echo -e "\n${YELLOW}===================================${NC}"
echo -e "${GREEN}Database validation complete!${NC}"
echo -e "${YELLOW}===================================${NC}"

exit 0
