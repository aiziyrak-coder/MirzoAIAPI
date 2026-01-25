#!/bin/bash

# Diagnose Backend Issues

echo "🔍 Diagnosing Backend Issues..."
echo "================================"

cd /root/mirzoai/backend
source venv/bin/activate

# 1. Check error logs
echo ""
echo "📋 Backend Error Logs (last 50 lines):"
echo "---------------------------------------"
journalctl -u mirzoai-backend -n 50 --no-pager | grep -A 5 -B 5 "Error\|Exception\|Traceback\|FAILURE" || journalctl -u mirzoai-backend -n 50 --no-pager | tail -30

# 2. Check gunicorn error log
echo ""
echo "📋 Gunicorn Error Log:"
echo "---------------------------------------"
if [ -f "/var/log/mirzoai-backend-error.log" ]; then
    tail -50 /var/log/mirzoai-backend-error.log
else
    echo "⚠️  Error log file not found: /var/log/mirzoai-backend-error.log"
fi

# 3. Try to run gunicorn manually to see errors
echo ""
echo "🧪 Testing Gunicorn Manually:"
echo "---------------------------------------"
cd /root/mirzoai/backend
source venv/bin/activate
timeout 5 /root/mirzoai/backend/venv/bin/gunicorn --workers 1 --bind 127.0.0.1:8001 --timeout 5 --check-config mirzoai.wsgi:application 2>&1 || echo "Command failed or timed out"

# 4. Check Python syntax
echo ""
echo "🔍 Checking Python Syntax:"
echo "---------------------------------------"
python3 -m py_compile mirzoai/wsgi.py 2>&1 || echo "Syntax error in wsgi.py"
python3 -m py_compile mirzoai/settings.py 2>&1 || echo "Syntax error in settings.py"

# 5. Check Django configuration
echo ""
echo "🔍 Testing Django Configuration:"
echo "---------------------------------------"
python3 manage.py check --deploy 2>&1 | head -30 || echo "Django check failed"

# 6. Check if .env exists
echo ""
echo "🔍 Checking .env file:"
echo "---------------------------------------"
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    echo "📄 .env file size: $(wc -l < .env) lines"
else
    echo "❌ .env file not found!"
fi

# 7. Check database
echo ""
echo "🔍 Testing Database Connection:"
echo "---------------------------------------"
python3 manage.py check --database default 2>&1 | head -20 || echo "Database check failed"

echo ""
echo "================================"
echo "✅ Diagnosis Complete!"
