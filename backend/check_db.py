#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aml_platform.settings')
django.setup()

from django.db import connection

def check_tables():
    cursor = connection.cursor()
    
    print("=== REPORTING ANALYTICS TABLES ===")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%reporting%' ORDER BY name;")
    reporting_tables = [row[0] for row in cursor.fetchall()]
    for table in reporting_tables:
        print(f"  {table}")
    
    print("\n=== ALL ANALYTICS/DASHBOARD RELATED TABLES ===")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE '%dashboard%' OR name LIKE '%widget%' OR name LIKE '%analytics%') ORDER BY name;")
    dashboard_tables = [row[0] for row in cursor.fetchall()]
    for table in dashboard_tables:
        print(f"  {table}")
    
    # Check for any tables with 'widget' in the name
    print("\n=== WIDGET RELATED TABLES ===")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%widget%' ORDER BY name;")
    widget_tables = [row[0] for row in cursor.fetchall()]
    for table in widget_tables:
        print(f"  {table}")
        # Show table schema
        cursor.execute(f"PRAGMA table_info({table});")
        columns = cursor.fetchall()
        for col in columns:
            print(f"    {col[1]} ({col[2]})")

if __name__ == "__main__":
    check_tables() 