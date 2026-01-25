# GitHub push va Serverda ishga tushirish

## 1. GitHubga push qilish

**.env hech qachon push qilinmaydi** — u `.gitignore` da. Faqat kod push qilinadi.

### 1.1. GitHubda yangi repo yaratish

1. https://github.com/new ga kiring
2. Repository name: masalan `mirzoai` yoki `MirzoAIAPI`
3. Public, **README qo‘shmasangiz ham** bo‘ladi (lokalda bor)
4. Create repository

### 1.2. Remote qo‘shish va push

Lokaldagi `D:\mirzoai` papkasida:

```bash
cd D:\mirzoai

# O‘zingizning repo URL ingizni qo‘ying (https yoki ssh):
git remote add origin https://github.com/USERNAME/REPO.git

# Branch nomi main bo‘lsa (GitHub default):
git branch -M main
git push -u origin main
```

Misol: `https://github.com/aiziyrak-coder/MirzoAIAPI.git` bo‘lsa:

```bash
git remote add origin https://github.com/aiziyrak-coder/MirzoAIAPI.git
git branch -M main
git push -u origin main
```

---

## 2. Serverda ishga tushirish

Serverda proyekt `/root/mirzoai` da bo‘lsa ( deploy skriptlariga muvofiq ).

### 2.1. Birinchi marta: clone + .env

```bash
ssh root@167.71.53.238   # yoki o‘zingizning server IP

cd /root
git clone https://github.com/USERNAME/REPO.git mirzoai
cd mirzoai
```

**To‘liq proyekt** (backend+frontend) bitta repoda bo‘lsa, struktura `mirzoai/backend` va `mirzoai/frontend` bo‘ladi. Eski deploy `backend` ni alohida clone qiladi — agar bitta repo bo‘lsa, `deploy_backend.sh` ni **yangilab** `mirzoai` clone qilinganida `backend` ichida bo‘lishini ta’minlang.

Soddaroq variant: **bitta repo `mirzoai`** — ichida `backend/` va `frontend/`. Serverda:

```bash
cd /root
# Eski mirzoai bo‘lsa, backend ni yangilash:
cd /root/mirzoai
git pull origin main

# Yoki yangi clone:
# git clone https://github.com/USERNAME/mirzoai.git
# cd mirzoai
```

### 2.2. Backend .env — GEMINI_API_KEY

**API kalitni serverda `backend/.env` ga qo‘ying.** GitHubda .env yo‘q.

```bash
cd /root/mirzoai/backend

# .env yo‘q bo‘lsa:
cp .env.example .env
nano .env   # yoki vim
```

`.env` da kamida:

```env
SECRET_KEY=....   # django.core.management.utils.get_random_secret_key
DEBUG=False
FRONTEND_URL=https://mirzoai.cdcgroup.uz
GEMINI_API_KEY=AIzaSy...sizning-kalitingiz...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_GROUP_ID=-5134591143
TELEGRAM_ADMIN_ID=5573250102
```

Saqlang (`Ctrl+O`, `Enter`, `Ctrl+X` nano da).

### 2.3. Backendni run qilish

**Variant A: Deploy skript (Gunicorn + systemd)**

```bash
cd /root/mirzoai
chmod +x deploy_backend.sh
./deploy_backend.sh
```

Skript venv, migrate, collectstatic, systemd service ni sozlaydi.  
**Eslatma:** `deploy_backend.sh` hozir `git clone ... MirzoAIAPI.git backend` qiladi. Agar siz bitta `mirzoai` repo push qilsangiz, `backend` alohida emas, `mirzoai/backend` ichida bo‘ladi. Shuning uchun ya **`deploy_backend.sh` ni proyekt strukturasiga qarab o‘zgartirishingiz** kerak yoki serverda qo‘lda quyidagilarni bajaring.

**Variant B: Qo‘lda (tez run)**

```bash
cd /root/mirzoai/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
python manage.py migrate --noinput
python manage.py collectstatic --noinput   # ixtiyoriy

# .env ni tekshiring
cat .env | grep GEMINI_API_KEY
```

Keyin:

```bash
# Gunicorn bilan (port 8000):
gunicorn --workers 3 --bind 127.0.0.1:8000 --timeout 120 mirzoai.wsgi:application
```

Yoki systemd orqali:

```bash
sudo systemctl restart mirzoai-backend
# yoki
sudo systemctl start mirzoai-backend
sudo systemctl status mirzoai-backend
```

### 2.4. Nginx

Backend `127.0.0.1:8000` da ishlaydi. Nginx allaqachon `mirzoaiapi.cdcgroup.uz` ni shu portga proxy qiladi bo‘lsa, qo‘shimcha sozlash kerak emas.  
Agar 502 bo‘lsa: `mirzoai-backend` ishlayotganini va port 8000 ochiq ekanini tekshiring.

### 2.5. Keyingi yangilanishlar

Kod o‘zgargach:

```bash
cd /root/mirzoai
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt   # kerak bo‘lsa
python manage.py migrate --noinput
sudo systemctl restart mirzoai-backend
```

**.env** ni o‘zgartirsangiz (masalan `GEMINI_API_KEY`), backendni **restart** qilishni unutmang.

---

## 3. Qisqacha

| Qadam | Joy | Buyruq / harakat |
|-------|-----|-------------------|
| Push | Lokal (Windows) | `git remote add origin URL`, `git push -u origin main` |
| .env | **Server** `backend/` | `cp .env.example .env`, `nano .env` → `GEMINI_API_KEY=...` |
| Run backend | Server | `deploy_backend.sh` yoki `gunicorn` / `systemctl restart mirzoai-backend` |
| Restart | Server | `.env` o‘zgargach `systemctl restart mirzoai-backend` |

.env hech qachon GitHubga push qilmaslik — maxfiy ma’lumotlar saqlanadi.
