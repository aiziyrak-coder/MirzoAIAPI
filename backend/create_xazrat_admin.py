#!/usr/bin/env python
"""
Create Django admin user with phone_number='xazrat' and password='123'
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mirzoai.settings')
django.setup()

from apps.api.models import User

def create_admin_user():
    phone_number = 'xazrat'
    password = '123'
    full_name = 'Xazrat Admin'
    organization = 'Mirzo AI'
    
    try:
        # Check if user exists
        user = User.objects.get(phone_number=phone_number)
        print(f"✅ Foydalanuvchi {phone_number} allaqachon mavjud. Yangilanmoqda...")
        
        # Update to admin
        user.full_name = full_name
        user.organization = organization
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.subscription_status = 'ACTIVE'
        user.is_active = True
        user.set_password(password)
        user.save()
        
        print(f"✅ Foydalanuvchi {phone_number} admin sifatida yangilandi!")
        
    except User.DoesNotExist:
        print(f"📝 Yangi admin foydalanuvchi yaratilmoqda: {phone_number}")
        
        # Create new admin user
        user = User.objects.create_superuser(
            phone_number=phone_number,
            password=password,
            full_name=full_name,
            organization=organization,
        )
        user.subscription_status = 'ACTIVE'
        user.is_admin = True
        user.save()
        
        print(f"✅ Admin foydalanuvchi {phone_number} muvaffaqiyatli yaratildi!")
    
    print(f"\n📋 Admin Login Ma'lumotlari:")
    print(f"   Telefon Raqam (Login): {phone_number}")
    print(f"   Parol: {password}")
    print(f"   Is Admin: {user.is_admin}")
    print(f"   Is Staff: {user.is_staff}")
    print(f"   Is Superuser: {user.is_superuser}")
    print(f"   Subscription: {user.subscription_status}")
    print(f"\n🌐 Django Admin URL: http://localhost:8000/admin/")

if __name__ == '__main__':
    create_admin_user()
