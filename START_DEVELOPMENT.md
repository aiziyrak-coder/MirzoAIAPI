# 🚀 Mirzo AI - Development Start Guide

## Frontend va Backend'ni Ishga Tushirish

### 1️⃣ Backend'ni Ishga Tushirish (Port 8000)

```bash
# Terminal 1 da
cd backend

# Virtual environment yaratish (birinchi marta)
python -m venv venv

# Virtual environment'ni aktivlashtirish
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Dependencies o'rnatish (birinchi marta)
pip install -r requirements.txt

# .env fayl yaratish
# Quyidagilarni .env fayliga qo'shing:
# SECRET_KEY=django-insecure-your-secret-key-here
# DEBUG=True
# GEMINI_API_KEY=your-gemini-api-key
# FRONTEND_URL=http://localhost:3000

# Migrations yaratish (birinchi marta)
python manage.py makemigrations

# Migrations qo'llash (birinchi marta)
python manage.py migrate

# Server'ni ishga tushirish (Port 8000)
python manage.py runserver 8000
```

✅ Backend **http://localhost:8000** da ishlaydi  
✅ API endpoints: **http://localhost:8000/api/**

---

### 2️⃣ Frontend'ni Ishga Tushirish (Port 3000)

```bash
# Terminal 2 da (yangi terminal)
cd frontend

# Dependencies o'rnatish (birinchi marta)
npm install

# .env fayl yaratish
# Quyidagini .env fayliga qo'shing:
# VITE_API_URL=http://localhost:8000/api

# Development server'ni ishga tushirish (Port 3000)
npm run dev
```

✅ Frontend **http://localhost:3000** da ishlaydi

---

## ✅ Tekshirish

1. **Backend ishlayotganini tekshirish:**
   - Brauzerda oching: http://localhost:8000/admin/
   - Yoki: http://localhost:8000/api/ai/quote/ (bu public endpoint)

2. **Frontend ishlayotganini tekshirish:**
   - Brauzerda oching: http://localhost:3000
   - Landing page ko'rinishi kerak

3. **Bog'lanish tekshirish:**
   - Frontend'dan backend'ga so'rov yuborish
   - Browser DevTools > Network tab'da API so'rovlarini ko'rish

---

## 🔧 Xatoliklar bo'lsa

### Backend xatoliklar:
- Port 8000 band bo'lsa: Boshqa port ishlatish yoki band portni to'xtatish
- Migration xatoliklar: `python manage.py migrate --run-syncdb`
- Import xatoliklar: `pip install -r requirements.txt` qayta bajarish

### Frontend xatoliklar:
- Port 3000 band bo'lsa: vite.config.ts da port o'zgartirish
- API connection xatolik: .env fayl to'g'ri sozlanganini tekshirish
- CORS xatolik: Backend settings.py da CORS_ALLOWED_ORIGINS tekshirish

---

## 📝 Important Notes

- Backend **avval** ishga tushirilishi kerak
- Keyin Frontend ishga tushiriladi
- Ikki server ham parallel ishlaydi
- Frontend avtomatik backend'ga bog'lanadi

---

## 🎯 Quick Commands

### Backend:
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python manage.py runserver 8000
```

### Frontend:
```bash
cd frontend
npm run dev
```

---

**Ishga tushdi! 🎉**
