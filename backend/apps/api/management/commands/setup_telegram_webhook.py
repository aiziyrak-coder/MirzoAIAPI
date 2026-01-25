"""
Django management command to setup Telegram webhook
Usage: python manage.py setup_telegram_webhook
"""
from django.core.management.base import BaseCommand
import os
import requests
from django.conf import settings


class Command(BaseCommand):
    help = 'Setup Telegram bot webhook'

    def add_arguments(self, parser):
        parser.add_argument(
            '--url',
            type=str,
            help='Webhook URL (e.g., https://yourdomain.com/api/telegram/webhook/)',
        )

    def handle(self, *args, **options):
        bot_token = os.getenv('TELEGRAM_BOT_TOKEN', '')
        
        if not bot_token:
            self.stdout.write(
                self.style.ERROR('TELEGRAM_BOT_TOKEN not found in environment variables!')
            )
            self.stdout.write(
                self.style.WARNING('Please add TELEGRAM_BOT_TOKEN to your .env file')
            )
            return

        webhook_url = options.get('url')
        
        if not webhook_url:
            # Try to get from settings or ask user
            self.stdout.write(
                self.style.WARNING('Webhook URL not provided. Please provide --url argument')
            )
            self.stdout.write(
                'Example: python manage.py setup_telegram_webhook --url https://yourdomain.com/api/telegram/webhook/'
            )
            return

        # Set webhook
        api_url = f"https://api.telegram.org/bot{bot_token}/setWebhook"
        
        try:
            response = requests.post(api_url, json={'url': webhook_url}, timeout=10)
            result = response.json()
            
            if result.get('ok'):
                self.stdout.write(
                    self.style.SUCCESS(f'Webhook successfully set to: {webhook_url}')
                )
                self.stdout.write(f'Description: {result.get("description", "No description")}')
            else:
                self.stdout.write(
                    self.style.ERROR(f'Failed to set webhook: {result.get("description", "Unknown error")}')
                )
                
        except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error setting webhook: {str(e)}')
                )
