# API kalit va Backend sozlash

## 1. Gemini API kalitni qayerga qo‘yish

**Fayl:** `backend/.env`

Agar `backend/.env` bo‘lmasa, `.env.example` dan nusxa oling:

```bash
cd backend
cp .env.example .env
```

Keyin `.env` ni ochib, `GEMINI_API_KEY` qatorini o‘z kalitingizga o‘zgartiring:

```env
GEMINI_API_KEY=AIzaSy...sizning-kalitingiz...
```

**.env** da boshqa muhim o‘zgaruvchilar:
- `SECRET_KEY` — Django uchun (ishlab chiqishda ixtiyoriy, prodda majburiy)
- `DEBUG` — `True` (dev) yoki `False` (prod)
- `FRONTEND_URL` — frontend manzili (masalan `https://mirzoai.cdcgroup.uz`)
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_GROUP_ID`, `TELEGRAM_ADMIN_ID` — Telegram bot uchun (ixtiyoriy)

**Eslatma:** API kalit uchun ustunlik tartibi:
1. **Admin panel** orqali SystemSettings da saqlangan kalit (agar bor bo‘lsa)
2. **`.env`** dagi `GEMINI_API_KEY`
3. Default kalit (kod ichida)

Shuning uchun oddiy variant — kalitni **`backend/.env`** ga qo‘yish.

---

## 2. Backend ishlamasa — tekshirish ro‘yxati

### 2.1. `.env` mavjudligi

```bash
cd backend
ls -la .env   # Linux/Mac
# yoki
dir .env      # Windows
```

Agar yo‘q bo‘lsa: `cp .env.example .env` qiling va `GEMINI_API_KEY` ni to‘ldiring.

### 2.2. Virtual muhit va kerakli paketlar

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

### 2.3. Migratsiyalar

```bash
cd backend
python manage.py migrate
```

### 2.4. Django tekshiruvi

```bash
python manage.py check --deploy
```

Xato bo‘lsa, ko‘rsatilgan qadamlarga amal qiling.

### 2.5. Lokal ishga tushirish (port 8000)

```bash
cd backend
python manage.py runserver 8000
```

Brauzerda: `http://localhost:8000/` — `{"message":"Mirzo AI API",...}` ko‘rinsa, backend ishlayapti.

### 2.6. Serverda (Gunicorn + Nginx)

- Gunicorn ishlayotganini tekshirish:
  ```bash
  sudo systemctl status mirzo-backend
  # yoki
  sudo systemctl status gunicorn
  ```
- Loglar:
  ```bash
  sudo journalctl -u mirzo-backend -n 100 --no-pager
  tail -100 /var/log/mirzoai-backend-error.log
  ```
- Backend qayerda tinglaydi (masalan `127.0.0.1:8000` yoki `8001`) va Nginx shu manzilga proxy qilayotganini tekshiring.

### 2.7. CORS

Frontend boshqa domen/portda bo‘lsa, `backend/mirzoai/settings.py` da `CORS_ALLOWED_ORIGINS` ga frontend manzili qo‘shilgan bo‘lishi kerak. `FRONTEND_URL` `.env` da to‘g‘ri bo‘lsa, settings uni qo‘shadi.

---

## 3. Qisqacha

| Narsa | Qayerda |
|-------|---------|
| **Gemini API kalit** | `backend/.env` → `GEMINI_API_KEY=...` |
| **.env yaratish** | `cd backend` → `cp .env.example .env` |
| **Backend ishga tushirish** | `python manage.py runserver 8000` |
| **Kalit o‘zgarganidan keyin** | Backendni qayta ishga tushiring (restart) |

Kalitni o‘zgartirgach, backend (yoki Gunicorn) ni **restart** qilishni unutmang.
