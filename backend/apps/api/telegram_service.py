"""
Telegram Bot Service for Payment Notifications
"""
import os
import json
import requests
from django.conf import settings
from .models import User
from django.utils import timezone
from datetime import timedelta


TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
TELEGRAM_GROUP_ID = os.getenv('TELEGRAM_GROUP_ID', '-5134591143')
TELEGRAM_ADMIN_ID = os.getenv('TELEGRAM_ADMIN_ID', '5573250102')

# Build API URL only if token exists
if TELEGRAM_BOT_TOKEN:
    TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"
else:
    TELEGRAM_API_URL = None


def send_payment_notification(user: User, receipt_file_path: str):
    """
    Send payment notification to Telegram group with screenshot and approval buttons
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_API_URL:
        print("Warning: TELEGRAM_BOT_TOKEN not configured. Skipping Telegram notification.")
        return None
    
    try:
        # Prepare message text
        message_text = f"""
💰 <b>Yangi To'lov Qabul Qilindi!</b>

👤 <b>Foydalanuvchi:</b> {user.full_name}
📞 <b>Telefon:</b> {user.phone_number}
🏢 <b>Tashkilot:</b> {user.organization}
📅 <b>Sana:</b> {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}
🆔 <b>User ID:</b> {user.id}

To'lov cheki quyida ko'rsatilgan. Iltimos, tekshirib tasdiqlang yoki rad eting.
        """
        
        # Prepare inline keyboard
        inline_keyboard = {
            'inline_keyboard': [
                [
                    {
                        'text': 'Tasdiqlash',
                        'callback_data': f'approve_{user.id}'
                    },
                    {
                        'text': 'Rad etish',
                        'callback_data': f'reject_{user.id}'
                    }
                ]
            ]
        }
        
        # Send photo with caption and inline keyboard
        with open(receipt_file_path, 'rb') as photo:
            files = {'photo': photo}
            data = {
                'chat_id': TELEGRAM_GROUP_ID,
                'caption': message_text,
                'parse_mode': 'HTML',
                'reply_markup': json.dumps(inline_keyboard)
            }
            
            response = requests.post(
                f"{TELEGRAM_API_URL}/sendPhoto",
                files=files,
                data=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('ok'):
                    return result.get('result', {}).get('message_id')
                else:
                    print(f"Telegram API error: {result.get('description', 'Unknown error')}")
            else:
                print(f"Telegram API HTTP error: {response.status_code} - {response.text}")
                
    except FileNotFoundError:
        print(f"Receipt file not found: {receipt_file_path}")
    except Exception as e:
        print(f"Error sending Telegram notification: {str(e)}")
    
    return None


def send_telegram_message(chat_id: str, text: str, parse_mode: str = 'HTML'):
    """
    Send a simple text message to Telegram
    """
    if not TELEGRAM_BOT_TOKEN:
        return False
    
    try:
        data = {
            'chat_id': chat_id,
            'text': text,
            'parse_mode': parse_mode
        }
        
        response = requests.post(
            f"{TELEGRAM_API_URL}/sendMessage",
            json=data,
            timeout=10
        )
        
        return response.status_code == 200 and response.json().get('ok', False)
    except Exception as e:
        print(f"Error sending Telegram message: {str(e)}")
        return False


def handle_telegram_callback(callback_data: str, user_id: str):
    """
    Handle Telegram callback (approve/reject payment)
    Returns: (success: bool, message: str)
    """
    try:
        print(f"handle_telegram_callback called with: callback_data={callback_data}, user_id={user_id}")
        if callback_data.startswith('approve_'):
            # Approve payment
            target_user_id = callback_data.replace('approve_', '')
            print(f"Approving payment for user ID: {target_user_id}")
            user = User.objects.get(id=target_user_id)
            
            user.subscription_status = 'ACTIVE'
            user.subscription_expiry = timezone.now() + timedelta(days=30)
            user.save()
            
            # Notify user (if they have Telegram)
            notification = f"""
✅ <b>To'lov Tasdiqlandi!</b>

Hurmatli {user.full_name},

Sizning to'lovingiz tasdiqlandi va Premium obuna faollashtirildi.

📅 <b>Amal qilish muddati:</b> {user.subscription_expiry.strftime('%Y-%m-%d')}

Barcha xizmatlardan foydalanishingiz mumkin!
            """
            
            return True, notification
            
        elif callback_data.startswith('reject_'):
            # Reject payment
            target_user_id = callback_data.replace('reject_', '')
            user = User.objects.get(id=target_user_id)
            
            user.subscription_status = 'NONE'
            user.subscription_expiry = None
            user.save()
            
            notification = f"""
❌ <b>To'lov Rad Etildi</b>

Hurmatli {user.full_name},

Afsuski, sizning to'lov chekingiz tasdiqlanmadi. Iltimos, quyidagilarni tekshiring:

1. To'lov miqdori to'g'ri ekanligi
2. Chek aniq va o'qilishi mumkin ekanligi
3. To'lov kartasi to'g'ri ekanligi

Qayta urinib ko'ring yoki qo'llab-quvvatlash xizmatiga murojaat qiling.
            """
            
            return True, notification
            
    except User.DoesNotExist:
        return False, "Foydalanuvchi topilmadi"
    except Exception as e:
        return False, f"Xatolik: {str(e)}"
    
    return False, "Noma'lum amal"
