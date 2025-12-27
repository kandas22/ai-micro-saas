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

# Run gunicorn
exec gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 wsgi:application

