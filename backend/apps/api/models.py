from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
import json


class UserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError('The Phone Number field must be set')
        
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_admin', True)
        extra_fields.setdefault('subscription_status', 'ACTIVE')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(phone_number, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User Model"""
    
    SUBSCRIPTION_STATUS_CHOICES = [
        ('NONE', 'None'),
        ('PENDING', 'Pending'),
        ('ACTIVE', 'Active'),
    ]
    
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, unique=True, db_index=True)
    organization = models.CharField(max_length=255)
    subscription_status = models.CharField(
        max_length=10,
        choices=SUBSCRIPTION_STATUS_CHOICES,
        default='NONE'
    )
    subscription_expiry = models.DateTimeField(null=True, blank=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    # History stored as JSON field
    history = models.JSONField(default=list, blank=True)
    
    # Receipt file name (for pending subscriptions)
    receipt_file_name = models.CharField(max_length=255, blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['full_name', 'organization']

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['phone_number']),
            models.Index(fields=['subscription_status']),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.phone_number})"
    
    def check_subscription_expiry(self):
        """Check and update subscription status if expired"""
        if self.subscription_status == 'ACTIVE' and self.subscription_expiry:
            if timezone.now() > self.subscription_expiry:
                self.subscription_status = 'NONE'
                self.subscription_expiry = None
                self.save()
        return self


class SavedDocument(models.Model):
    """Saved Document History"""
    
    DOCUMENT_TYPE_CHOICES = [
        ('HISOBOT', 'Hisobot (Tahliliy)'),
        ('AHBOROTNOMA', 'Axborotnoma (Newsletter)'),
        ('MAORUZA', 'Ma\'ruza (Rasmiy)'),
        ('NUTQ', 'Nutq (Tantanali/Ilhomlantiruvchi)'),
        ('TABRIK', 'Tabrik Matni'),
        ('BUYRUQ', 'Buyruq / Qaror loyihasi'),
        ('ARIZA', 'Ariza / Tushuntirish xati'),
        ('STRATEGIYA', 'Rivojlanish Strategiyasi'),
        ('MATBUOT', 'Matbuot xabari (Press Release)'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=500)
    doc_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'saved_documents'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.title} - {self.user.full_name}"


class SystemSettings(models.Model):
    """System-wide settings managed by super admin"""
    key = models.CharField(max_length=100, unique=True, primary_key=True)
    value = models.TextField()
    description = models.CharField(max_length=255, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='settings_updates')

    class Meta:
        db_table = 'system_settings'
        verbose_name = 'System Setting'
        verbose_name_plural = 'System Settings'

    def __str__(self):
        return f"{self.key}: {self.value[:50]}..."
