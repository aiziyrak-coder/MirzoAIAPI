"""
Django management command to test Telegram bot
Usage: python manage.py test_telegram_bot
"""
from django.core.management.base import BaseCommand
import os
import requests
from apps.api.telegram_service import send_telegram_message, TELEGRAM_GROUP_ID, TELEGRAM_ADMIN_ID, TELEGRAM_BOT_TOKEN


class Command(BaseCommand):
    help = 'Test Telegram bot connection'

    def handle(self, *args, **options):
        bot_token = TELEGRAM_BOT_TOKEN or os.getenv('TELEGRAM_BOT_TOKEN', '')
        
        if not bot_token:
            self.stdout.write(
                self.style.ERROR('TELEGRAM_BOT_TOKEN not found in environment variables!')
            )
            return

        # Test 1: Get bot info
        self.stdout.write('Testing bot connection...')
        try:
            response = requests.get(
                f"https://api.telegram.org/bot{bot_token}/getMe",
                timeout=10
            )
            result = response.json()
            
            if result.get('ok'):
                bot_info = result.get('result', {})
                self.stdout.write(
                    self.style.SUCCESS('Bot connected successfully!')
                )
                self.stdout.write(f'Bot username: @{bot_info.get("username", "N/A")}')
                self.stdout.write(f'Bot name: {bot_info.get("first_name", "N/A")}')
            else:
                self.stdout.write(
                    self.style.ERROR(f'Failed to connect: {result.get("description", "Unknown error")}')
                )
                return
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error connecting to bot: {str(e)}')
            )
            return

        # Test 2: Send test message to group
        self.stdout.write('\nSending test message to group...')
        test_message = "<b>Test Xabar</b>\n\nBu test xabari. Agar siz buni ko'rsangiz, bot to'g'ri ishlayapti!"
        
        if send_telegram_message(TELEGRAM_GROUP_ID, test_message):
            self.stdout.write(
                self.style.SUCCESS('Test message sent to group successfully!')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Failed to send test message. Check if bot is added to group and has permission to send messages.')
            )

        # Test 3: Check webhook
        self.stdout.write('\nChecking webhook status...')
        try:
            response = requests.get(
                f"https://api.telegram.org/bot{bot_token}/getWebhookInfo",
                timeout=10
            )
            result = response.json()
            
            if result.get('ok'):
                webhook_info = result.get('result', {})
                if webhook_info.get('url'):
                    self.stdout.write(
                        self.style.SUCCESS(f'Webhook is set: {webhook_info.get("url")}')
                    )
                    self.stdout.write(f'Pending updates: {webhook_info.get("pending_update_count", 0)}')
                else:
                    self.stdout.write(
                        self.style.WARNING('Webhook is not set. Use: python manage.py setup_telegram_webhook --url YOUR_URL')
                    )
            else:
                self.stdout.write(
                    self.style.ERROR(f'Failed to get webhook info: {result.get("description", "Unknown error")}')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error checking webhook: {str(e)}')
            )

        self.stdout.write('\n' + self.style.SUCCESS('Test completed!'))
