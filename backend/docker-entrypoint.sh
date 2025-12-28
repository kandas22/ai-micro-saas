#!/bin/bash
set -e

# Create wsgi.py if it doesn't exist
if [ ! -f wsgi.py ]; then
    cat > wsgi.py << 'EOF'
#!/usr/bin/env python
"""WSGI entry point for production servers (Gunicorn)."""
from app import create_app
application = create_app()
EOF
    echo "Created wsgi.py"
fi

# Make sure wsgi.py is executable
chmod +x wsgi.py 2>/dev/null || true

# Wait for database to be ready
echo "Waiting for database..."
python -c "
import time
import psycopg2
import os

database_url = os.environ.get('DATABASE_URL', '')
max_retries = 30
retry_count = 0

while retry_count < max_retries:
    try:
        conn = psycopg2.connect(database_url)
        conn.close()
        print('Database is ready!')
        break
    except psycopg2.OperationalError:
        retry_count += 1
        print(f'Database not ready, retrying... ({retry_count}/{max_retries})')
        time.sleep(1)
else:
    print('Could not connect to database')
    exit(1)
"

# Run database migrations
echo "Running database migrations..."
flask db upgrade

# Run gunicorn
exec gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 wsgi:application

