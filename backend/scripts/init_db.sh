#!/bin/bash

# Set environment variables
export PGHOST=localhost
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=your_secure_password

# Create database and user
psql -c "CREATE DATABASE aml_db;"
psql -c "CREATE USER aml_user WITH ENCRYPTED PASSWORD 'your_secure_password';"
psql -c "ALTER ROLE aml_user SET client_encoding TO 'utf8';"
psql -c "ALTER ROLE aml_user SET default_transaction_isolation TO 'read committed';"
psql -c "ALTER ROLE aml_user SET timezone TO 'Asia/Dubai';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE aml_db TO aml_user;"

# Connect to the database and create extensions
psql -d aml_db -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
psql -d aml_db -c "CREATE EXTENSION IF NOT EXISTS \"hstore\";"
psql -d aml_db -c "CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";" 