#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "\n${YELLOW}🚀 Starting AML Platform Database Setup${NC}\n"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check Docker installation
echo "Checking Docker installation..."
if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker Desktop from:${NC}"
    echo "https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"

# Step 2: Create necessary directories
echo "Creating required directories..."
mkdir -p docker/postgres
mkdir -p logs
echo -e "${GREEN}✅ Directories created${NC}"

# Step 3: Check .env file
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Creating .env file from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
fi

# Step 4: Start Docker services
echo "Starting Docker services..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start Docker services${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker services started${NC}"

# Step 5: Wait for PostgreSQL
echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker-compose exec db pg_isready -U aml_user -d aml_db >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ PostgreSQL failed to start${NC}"
        exit 1
    fi
    echo "Waiting... ($i/30)"
    sleep 1
done

# Step 6: Run database validation script
echo "Running database validation..."
python scripts/validate_db.py
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Database validation failed${NC}"
    exit 1
fi

# Step 7: Apply migrations
echo "Applying Django migrations..."
python manage.py migrate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to apply migrations${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Migrations applied successfully${NC}"

# Step 8: Final status check
echo -e "\n${YELLOW}📊 Final Status Check:${NC}"
echo "Checking Docker services..."
docker-compose ps

echo -e "\n${GREEN}✅ Setup Complete!${NC}"
echo -e "\nTo connect to the database:"
echo "1. Using psql: docker-compose exec db psql -U aml_user -d aml_db"
echo "2. Using Django: python manage.py dbshell"
echo -e "\nTo view logs:"
echo "docker-compose logs -f db" 