# ⚡ Tezkor Boshlash - Mirzo AI

## 🎯 Port Sozlamalari

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000
- **API Base:** http://localhost:8000/api

---

## 📋 1. Backend (Port 8000)

### Windows:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 8000
```

### Linux/Mac:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 8000
```

**✅ Backend ishlaydi: http://localhost:8000**

---

## 📋 2. Frontend (Port 3000)

```bash
cd frontend
npm install
npm run dev
```

**✅ Frontend ishlaydi: http://localhost:3000**

---

## ⚙️ Environment Variables

### Backend `.env` fayl:
```env
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True
GEMINI_API_KEY=your-gemini-api-key-here
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env` fayl:
```env
VITE_API_URL=http://localhost:8000/api
```

---

## ✅ Tekshirish

1. Backend: http://localhost:8000/admin/
2. Frontend: http://localhost:3000
3. API Test: http://localhost:8000/api/ai/quote/

---

## 🔗 Bog'lanish

- Frontend avtomatik backend'ga `http://localhost:8000/api` orqali bog'lanadi
- CORS sozlangan va ishlaydi
- JWT authentication ishlaydi

---

**Tayyor! 🚀**
