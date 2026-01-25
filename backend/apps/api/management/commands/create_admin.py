"""
Django management command to create admin user
Usage: python manage.py create_admin
"""
from django.core.management.base import BaseCommand
from apps.api.models import User


class Command(BaseCommand):
    help = 'Create admin user'

    def add_arguments(self, parser):
        parser.add_argument(
            '--phone',
            type=str,
            default='998948788878',
            help='Phone number (default: 998948788878)',
        )
        parser.add_argument(
            '--password',
            type=str,
            default='123',
            help='Password (default: 123)',
        )
        parser.add_argument(
            '--name',
            type=str,
            default='System Admin',
            help='Full name (default: System Admin)',
        )
        parser.add_argument(
            '--organization',
            type=str,
            default='Mirzo AI',
            help='Organization (default: Mirzo AI)',
        )

    def handle(self, *args, **options):
        phone = options['phone']
        password = options['password']
        full_name = options['name']
        organization = options['organization']
        
        # Remove + if present
        phone = phone.replace('+', '')
        
        # Check if user exists
        try:
            user = User.objects.get(phone_number=phone)
            self.stdout.write(
                self.style.WARNING(f'User with phone {phone} already exists!')
            )
            
            # Update to admin
            user.is_admin = True
            user.is_staff = True
            user.is_superuser = True
            user.subscription_status = 'ACTIVE'
            user.set_password(password)
            user.save()
            
            self.stdout.write(
                self.style.SUCCESS(f'Existing user updated to admin: {user.full_name} ({user.phone_number})')
            )
        except User.DoesNotExist:
            # Create new admin user
            user = User.objects.create_user(
                phone_number=phone,
                password=password,
                full_name=full_name,
                organization=organization,
                is_admin=True,
                is_staff=True,
                is_superuser=True,
                subscription_status='ACTIVE'
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'Admin user created successfully!')
            )
            self.stdout.write(f'Phone: {user.phone_number}')
            self.stdout.write(f'Name: {user.full_name}')
            self.stdout.write(f'Password: {password}')
            self.stdout.write(
                self.style.WARNING('Please change the password after first login!')
            )
