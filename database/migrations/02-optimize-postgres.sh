#!/bin/bash
# PostgreSQL optimization script for NarrativeMorph
# This script applies performance optimizations to PostgreSQL

set -e

# Check if running as postgres user
if [ "$(whoami)" != "postgres" ]; then
  echo "This script must be run as postgres user"
  exit 1
fi

# Create custom configuration file
cat > /var/lib/postgresql/data/pgdata/conf.d/narrative_morph_optimizations.conf << EOF
# NarrativeMorph PostgreSQL Optimizations
# These settings are tuned for the hackathon/development environment

# Connection Settings
max_connections = 100
superuser_reserved_connections = 3

# Memory Settings
shared_buffers = ${POSTGRES_SHARED_BUFFERS:-256MB}
work_mem = ${POSTGRES_WORK_MEM:-8MB}
maintenance_work_mem = ${POSTGRES_MAINTENANCE_WORK_MEM:-64MB}
effective_cache_size = ${POSTGRES_EFFECTIVE_CACHE_SIZE:-768MB}

# Query Planner
random_page_cost = 1.1
effective_io_concurrency = 200

# Write Ahead Log (WAL)
wal_buffers = 16MB
wal_writer_delay = 200ms
wal_writer_flush_after = 1MB

# Background Writer
bgwriter_delay = 200ms
bgwriter_lru_maxpages = 100
bgwriter_lru_multiplier = 2.0

# Logging for development
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0

# Text Search Configuration
default_text_search_config = 'pg_catalog.english'

# Full-Text Search
max_wal_size = 1GB
min_wal_size = 80MB
EOF

echo "PostgreSQL optimizations have been applied for NarrativeMorph!"

# Create maintenance script that can be run manually
cat > /var/lib/postgresql/data/maintenance.sh << EOF
#!/bin/bash
# NarrativeMorph database maintenance script
# Run this periodically to optimize database performance

set -e
echo "Running VACUUM ANALYZE on all tables..."
psql -U \${POSTGRES_USER} -d \${POSTGRES_DB} -c "VACUUM ANALYZE;"

echo "Reindexing tables..."
psql -U \${POSTGRES_USER} -d \${POSTGRES_DB} -c "REINDEX DATABASE \${POSTGRES_DB};"

echo "Updating table statistics..."
psql -U \${POSTGRES_USER} -d \${POSTGRES_DB} -c "ANALYZE;"

echo "Database maintenance completed successfully!"
EOF

chmod +x /var/lib/postgresql/data/maintenance.sh

echo "Maintenance script created at /var/lib/postgresql/data/maintenance.sh"
