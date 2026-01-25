# Mirzo AI Backend (Django REST Framework)

Backend API server for Mirzo AI Platform built with Django REST Framework.

## Setup

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Create `.env` file:**
```bash
# Copy from example
SECRET_KEY=your-secret-key-here
DEBUG=True
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:3000
```

4. **Run migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Create superuser (optional):**
```bash
python manage.py createsuperuser
```

6. **Start development server:**
```bash
# Option 1: Direct command
python manage.py runserver 8000

# Option 2: Windows batch file
run_server.bat

# Option 3: Linux/Mac shell script
chmod +x run_server.sh
./run_server.sh
```

Backend will run on **http://localhost:8000**

## API Base URL

All API endpoints are available at: `http://localhost:8000/api/`

## Frontend Connection

Backend is configured to accept requests from: `http://localhost:3000`

CORS is properly configured for cross-origin requests.

## Quick Start Commands

```bash
# Activate virtual environment
source venv/bin/activate  # Windows: venv\Scripts\activate

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start server
python manage.py runserver 8000

# Create new app
python manage.py startapp app_name

# Collect static files (production)
python manage.py collectstatic
```

## Environment Variables

Required in `.env` file:
- `SECRET_KEY` - Django secret key (required)
- `DEBUG` - Debug mode (True/False)
- `GEMINI_API_KEY` - Google Gemini API key (required for AI features)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)

## Production Deployment

1. Set `DEBUG=False` in `.env`
2. Set proper `SECRET_KEY`
3. Configure PostgreSQL database
4. Collect static files: `python manage.py collectstatic`
5. Use production WSGI server (gunicorn)
6. Configure reverse proxy (nginx)
7. Set proper CORS origins
