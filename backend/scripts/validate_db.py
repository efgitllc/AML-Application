#!/usr/bin/env python
import os
import sys
import time
import subprocess
from pathlib import Path
import psycopg2
from urllib.parse import urlparse
import django
from django.conf import settings

def check_docker():
    """Check if Docker and Docker Compose are installed"""
    try:
        subprocess.run(['docker', '--version'], check=True, capture_output=True)
        subprocess.run(['docker-compose', '--version'], check=True, capture_output=True)
        print("✅ Docker and Docker Compose are installed")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Docker or Docker Compose not found. Please install Docker Desktop.")
        return False

def check_env_file():
    """Check if .env file exists and has required variables"""
    env_file = Path('.env')
    if not env_file.exists():
        print("❌ .env file not found")
        return False
    
    required_vars = [
        'DATABASE_URL',
        'POSTGRES_DB',
        'POSTGRES_USER',
        'POSTGRES_PASSWORD'
    ]
    
    with open(env_file) as f:
        env_contents = f.read()
        
    missing_vars = [var for var in required_vars if var not in env_contents]
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        return False
    
    print("✅ Environment file check passed")
    return True

def parse_database_url():
    """Parse DATABASE_URL from .env file"""
    env_file = Path('.env')
    if not env_file.exists():
        return None
    
    with open(env_file) as f:
        for line in f:
            if line.startswith('DATABASE_URL='):
                url = line.split('=', 1)[1].strip()
                parsed = urlparse(url)
                return {
                    'dbname': parsed.path[1:],
                    'user': parsed.username,
                    'password': parsed.password,
                    'host': parsed.hostname,
                    'port': parsed.port or 5432
                }
    return None

def check_postgres_connection():
    """Test PostgreSQL connection"""
    db_config = parse_database_url()
    if not db_config:
        print("❌ Could not parse DATABASE_URL")
        return False
    
    max_retries = 30
    retry_interval = 2
    
    for i in range(max_retries):
        try:
            conn = psycopg2.connect(**db_config)
            conn.close()
            print("✅ PostgreSQL connection successful")
            return True
        except psycopg2.Error as e:
            if i == max_retries - 1:
                print(f"❌ PostgreSQL connection failed: {e}")
                return False
            print(f"⏳ Waiting for PostgreSQL to be ready (attempt {i+1}/{max_retries})")
            time.sleep(retry_interval)

def check_django_config():
    """Verify Django database configuration"""
    try:
        django.setup()
        if 'default' not in settings.DATABASES:
            print("❌ No default database configured in Django settings")
            return False
        
        db_config = settings.DATABASES['default']
        if db_config.get('ENGINE') != 'django.db.backends.postgresql':
            print("❌ Database engine is not PostgreSQL")
            return False
        
        print("✅ Django database configuration is correct")
        return True
    except Exception as e:
        print(f"❌ Django configuration error: {e}")
        return False

def check_docker_services():
    """Check if Docker services are running"""
    try:
        result = subprocess.run(
            ['docker-compose', 'ps', '--services', '--filter', 'status=running'],
            check=True,
            capture_output=True,
            text=True
        )
        services = result.stdout.strip().split('\n')
        required_services = {'db', 'redis'}
        running_services = set(services)
        
        if required_services.issubset(running_services):
            print("✅ All required Docker services are running")
            return True
        else:
            missing = required_services - running_services
            print(f"❌ Missing services: {', '.join(missing)}")
            return False
    except subprocess.CalledProcessError:
        print("❌ Error checking Docker services")
        return False

def main():
    """Main validation function"""
    print("\n🔍 Starting Database Setup Validation\n")
    
    checks = [
        ("Docker Installation", check_docker),
        ("Environment File", check_env_file),
        ("Docker Services", check_docker_services),
        ("PostgreSQL Connection", check_postgres_connection),
        ("Django Configuration", check_django_config)
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n📋 Checking {name}...")
        try:
            result = check_func()
            results.append(result)
        except Exception as e:
            print(f"❌ Error during {name} check: {e}")
            results.append(False)
    
    print("\n📊 Validation Summary:")
    if all(results):
        print("\n✅ All checks passed! Database setup is correct.")
    else:
        print("\n❌ Some checks failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == '__main__':
    main() 