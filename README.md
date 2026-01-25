# Mirzo AI Platform

Davlat boshqaruvi va tahlil uchun sun'iy intellektga asoslangan raqamli yordamchi platforma.

## 🚀 Quick Start

### Backend (Django) - Port 8000

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create .env file
# Copy .env.example and fill in your values:
# SECRET_KEY=your-secret-key
# DEBUG=True
# GEMINI_API_KEY=your-gemini-api-key
# FRONTEND_URL=http://localhost:3000

# 4. Run migrations
python manage.py makemigrations
python manage.py migrate

# 5. Start server (Port 8000)
python manage.py runserver 8000
```

Backend will run on: **http://localhost:8000**  
API endpoints: **http://localhost:8000/api/**

### Frontend (React) - Port 3000

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# 3. Start development server (Port 3000)
npm run dev
```

Frontend will run on: **http://localhost:3000**

## 📁 Project Structure

```
mirzoai/
├── frontend/          # React + TypeScript (Port 3000)
│   ├── components/    # React components
│   ├── services/      # API services
│   └── types.ts       # TypeScript types
│
├── backend/           # Django REST Framework (Port 8000)
│   ├── mirzoai/       # Django project settings
│   ├── apps/
│   │   └── api/       # API app
│   ├── manage.py
│   └── requirements.txt
│
└── README.md
```

## 🔌 Connection Settings

- **Frontend URL:** http://localhost:3000
- **Backend URL:** http://localhost:8000
- **API Base URL:** http://localhost:8000/api

Frontend automatically connects to backend at the configured API URL.

## 🛠️ Development

### Backend Commands

```bash
cd backend

# Start server
python manage.py runserver 8000

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Django shell
python manage.py shell
```

### Frontend Commands

```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📡 API Endpoints

### Authentication (`/api/auth/`)
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/admin/` - Admin login
- `GET /api/auth/me/` - Get current user

### Documents (`/api/documents/`)
- `POST /api/documents/generate/` - Generate document
- `POST /api/documents/refine/` - Refine document
- `GET /api/documents/history/` - Get history
- `DELETE /api/documents/history/{id}/` - Delete history item

### Users (`/api/users/`)
- `GET /api/users/profile/` - Get profile
- `PUT /api/users/profile/` - Update profile
- `POST /api/users/subscription/` - Update subscription

### Admin (`/api/admin/`)
- `GET /api/admin/users/` - Get all users
- `PUT /api/admin/users/{id}/subscription/` - Update user subscription
- `GET /api/admin/stats/` - Get statistics

### AI (`/api/ai/`)
- `GET /api/ai/quote/` - Get motivational quote
- `POST /api/ai/chat/` - Chat with AI
- `GET /api/ai/briefing/` - Get daily briefing
- `POST /api/ai/analyze_image/` - Analyze image

## 🔐 Authentication

All protected endpoints require JWT token:
```
Authorization: Bearer <access_token>
```

## 🌐 CORS Configuration

Backend is configured to accept requests from:
- `http://localhost:3000` (Frontend)
- `http://127.0.0.1:3000`

## 📝 Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

## 🚀 Production Deployment

### Backend
1. Set `DEBUG=False`
2. Configure PostgreSQL
3. Set proper `SECRET_KEY`
4. Use gunicorn/uwsgi
5. Configure nginx
6. Set CORS origins

### Frontend
1. Build: `npm run build`
2. Serve with nginx or static hosting
3. Update API URL in production

## 📚 Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend:** Django 5.0, Django REST Framework, Python 3.10+
- **AI:** Google Gemini API
- **Database:** SQLite (dev) / PostgreSQL (production)
- **Auth:** JWT (djangorestframework-simplejwt)

## 📄 License

ISC

## 👥 Contributors

CDCGroup & CraDev
