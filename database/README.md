# PostgreSQL Setup for NarrativeMorph

## Overview
This document describes the PostgreSQL setup for the NarrativeMorph project.

## Configuration
The PostgreSQL database is configured with the following settings:
- Database name: `narrative_morph`
- Username: `raguser`
- Password: `ragpass123` (change this in production)
- Port: 5432 (default)
- Data persistence: Docker volume `postgres_data`

## pgAdmin Access
pgAdmin is available for database management:
- URL: http://localhost:5050
- Email: admin@narrativemorph.dev
- Password: hackathon2025

## Database Initialization
The database is automatically initialized with:
1. Essential extensions (uuid-ossp, pg_trgm, hstore)
2. Initial schema and user tables
3. Default admin user for the application
4. Performance optimizations for PostgreSQL

## Connecting to the Database
To connect to the PostgreSQL database using psql inside the container:

```bash
docker exec -it narrative_postgres psql -U raguser -d narrative_morph
```

Using psql from your host (if PostgreSQL client is installed):
```bash
psql -h localhost -p 5432 -U raguser -d narrative_morph
```

## Database Maintenance
A maintenance script is included and can be run with:

```bash
docker exec -it narrative_postgres /var/lib/postgresql/data/maintenance.sh
```

## Performance Settings
The PostgreSQL configuration includes optimized settings for:
- Connection pooling
- Memory allocation
- Query planning
- Logging (development mode)
- Full-text search capabilities

## Backup and Restore
To backup the database:

```bash
docker exec -t narrative_postgres pg_dump -U raguser -d narrative_morph > backup_$(date +%Y%m%d_%H%M%S).sql
```

To restore the database:

```bash
cat backup_file.sql | docker exec -i narrative_postgres psql -U raguser -d narrative_morph
```
