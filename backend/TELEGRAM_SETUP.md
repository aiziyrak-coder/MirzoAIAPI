# Telegram Bot Sozlash

## 1. Bot Tokenini Qo'shish

`.env` fayliga quyidagilarni qo'shing:

```env
TELEGRAM_BOT_TOKEN=8399809187:AAFn1cxL_Ka9eQ9geaEbnhb5mQLCoryTVBc
TELEGRAM_GROUP_ID=-5134591143
TELEGRAM_ADMIN_ID=5573250102
```

## 2. Botni Test Qilish

Bot ishlayotganini tekshirish:

```bash
cd backend
python manage.py test_telegram_bot
```

Bu quyidagilarni tekshiradi:
- Bot token to'g'riligini
- Bot ma'lumotlarini
- Guruhga test xabar yuborish
- Webhook holatini

## 3. Webhook O'rnatish

### Development (Localhost)

Agar localhost'da ishlatmoqchi bo'lsangiz, ngrok yoki shunga o'xshash tunnel ishlatishingiz kerak:

```bash
# ngrok o'rnatish (Windows uchun)
# 1. ngrok yuklab oling: https://ngrok.com/download
# 2. Quyidagilarni bajaring:

ngrok http 8000

# Keyin chiqadigan URL'ni oling (masalan: https://abc123.ngrok.io)
# Va webhook o'rnating:

python manage.py setup_telegram_webhook --url https://abc123.ngrok.io/api/telegram/webhook/
```

### Production (Server)

Agar serverda ishlatmoqchi bo'lsangiz:

```bash
python manage.py setup_telegram_webhook --url https://yourdomain.com/api/telegram/webhook/
```

## 4. Webhook'ni Tekshirish

Webhook holatini tekshirish:

```bash
python manage.py test_telegram_bot
```

Yoki to'g'ridan-to'g'ri Telegram API orqali:

```bash
curl https://api.telegram.org/bot8399809187:AAFn1cxL_Ka9eQ9geaEbnhb5mQLCoryTVBc/getWebhookInfo
```

## 5. Guruhga Bot Qo'shish

1. Telegram'da guruhga kiring
2. Botni guruhga qo'shing: `@your_bot_username`
3. Botga admin huquqlarini bering (xabarlar yuborish va boshqarish)

## 6. Ishlatish

Endi foydalanuvchilar to'lov chekini yuklaganda:
- Telegram guruhga avtomatik xabar keladi
- Screenshot ko'rsatiladi
- "Tasdiqlash" va "Rad etish" tugmalari bo'ladi
- Admin (5573250102) tugmalarni bosib to'lovni tasdiqlaydi yoki rad etadi

## Muammo Hal Qilish

### Bot xabar yubormayapti
- Bot guruhga qo'shilganligini tekshiring
- Botga admin huquqlari berilganligini tekshiring
- `test_telegram_bot` buyrug'i bilan test qiling

### Webhook ishlamayapti
- Webhook URL to'g'ri ekanligini tekshiring
- Server ishlayotganligini tekshiring
- SSL sertifikat to'g'ri ekanligini tekshiring (HTTPS kerak)

### Callback ishlamayapti
- Admin ID to'g'ri ekanligini tekshiring
- Webhook o'rnatilganligini tekshiring
- Server loglarini tekshiring
