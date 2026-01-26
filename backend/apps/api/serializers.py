from rest_framework import serializers
from .models import User, SavedDocument


class UserSerializer(serializers.ModelSerializer):
    """User Serializer"""
    
    # Add camelCase fields for frontend compatibility
    fullName = serializers.CharField(source='full_name', read_only=True)
    phoneNumber = serializers.CharField(source='phone_number', read_only=True)
    subscriptionStatus = serializers.CharField(source='subscription_status', read_only=True)
    subscriptionExpiry = serializers.DateTimeField(source='subscription_expiry', read_only=True)
    isAdmin = serializers.BooleanField(source='is_admin', read_only=True)
    isActive = serializers.BooleanField(source='is_active', read_only=True)
    dateJoined = serializers.DateTimeField(source='date_joined', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    receiptFileName = serializers.CharField(source='receipt_file_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'full_name', 'phone_number', 'organization', 
                 'subscription_status', 'subscription_expiry', 'is_admin', 
                 'is_active', 'date_joined', 'updated_at', 'receipt_file_name',
                 # camelCase aliases
                 'fullName', 'phoneNumber', 'subscriptionStatus', 
                 'subscriptionExpiry', 'isAdmin', 'isActive', 
                 'dateJoined', 'updatedAt', 'receiptFileName']
        read_only_fields = ['id', 'date_joined', 'updated_at', 'receipt_file_name']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """User Registration Serializer"""
    password = serializers.CharField(write_only=True, required=True, min_length=6, help_text="Parol kamida 6 belgidan iborat bo'lishi kerak")
    password2 = serializers.CharField(write_only=True, required=True, min_length=6)

    class Meta:
        model = User
        fields = ['full_name', 'phone_number', 'password', 'password2', 'organization']

    def validate_phone_number(self, value):
        """Validate phone number format and ensure +998 prefix"""
        # Remove spaces and dashes
        phone = value.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        
        # Remove + if present
        if phone.startswith('+'):
            phone = phone[1:]
        
        # Check if it's a valid Uzbek phone number
        if not phone.isdigit():
            raise serializers.ValidationError("Telefon raqami faqat raqamlardan iborat bo'lishi kerak.")
        
        # If starts with 998, remove it (we'll add it back)
        if phone.startswith('998') and len(phone) >= 12:
            phone = phone[3:]  # Remove 998 prefix
        
        # Validate: should be 9 digits (O'zbekiston: 50, 71, 73, 90, 91, 93, 94, 95, 97, 98, 99 bilan boshlanishi mumkin)
        if len(phone) == 9 and phone.isdigit():
            # Return with 998 prefix for consistency
            return '998' + phone
        else:
            raise serializers.ValidationError("Telefon raqami noto'g'ri formatda. 9 raqam kiriting (masalan: 501234567, 901234567)")

    def validate_password(self, value):
        """Validate password strength"""
        if len(value) < 6:
            raise serializers.ValidationError("Parol kamida 6 belgidan iborat bo'lishi kerak.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Parollar mos kelmadi."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            phone_number=validated_data['phone_number'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            organization=validated_data['organization'],
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """User Login Serializer"""
    phone_number = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class SavedDocumentSerializer(serializers.ModelSerializer):
    """Saved Document Serializer"""
    
    class Meta:
        model = SavedDocument
        fields = ['id', 'title', 'doc_type', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']


class DocumentHistorySerializer(serializers.Serializer):
    """Document History Item Serializer (for JSON field)"""
    id = serializers.CharField()
    title = serializers.CharField()
    type = serializers.CharField()
    date = serializers.CharField()
    content = serializers.CharField()


class GenerateDocumentSerializer(serializers.Serializer):
    """Document Generation Request Serializer"""
    doc_type = serializers.CharField(required=True)
    sector = serializers.CharField(required=True)
    topic = serializers.CharField(required=True)
    goal = serializers.CharField(required=False, allow_blank=True)
    use_search = serializers.BooleanField(default=True)
    organization = serializers.CharField(required=False, allow_blank=True)
    files = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        allow_empty=True
    )


class RefineDocumentSerializer(serializers.Serializer):
    """Document Refinement Request Serializer"""
    original_html = serializers.CharField(required=True)
    instruction = serializers.CharField(required=False, allow_blank=True)
    additional_files = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        allow_empty=True
    )


class ChatMessageSerializer(serializers.Serializer):
    """Chat Message Serializer"""
    history = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True
    )
    message = serializers.CharField(required=True)


class SubscriptionUpdateSerializer(serializers.Serializer):
    """Subscription Update Serializer"""
    receipt = serializers.FileField(required=False, allow_null=True)


class AdminSubscriptionUpdateSerializer(serializers.Serializer):
    """Admin Subscription Update Serializer"""
    status = serializers.ChoiceField(
        choices=['NONE', 'PENDING', 'ACTIVE'],
        required=True
    )


class GeminiApiKeySerializer(serializers.Serializer):
    """Gemini API Key Update Serializer"""
    api_key = serializers.CharField(required=True, min_length=10, help_text="Gemini API Key")


class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Admin User Creation Serializer"""
    password = serializers.CharField(write_only=True, required=True, min_length=3)
    
    class Meta:
        model = User
        fields = ['full_name', 'phone_number', 'password', 'organization', 
                 'subscription_status', 'subscription_expiry', 'is_admin', 'is_active']
    
    def validate_phone_number(self, value):
        """Ensure phone number has 998 prefix"""
        phone = value.replace('+', '').replace(' ', '').replace('-', '').replace('(', '').replace(')', '').strip()
        if not phone.isdigit():
            raise serializers.ValidationError("Telefon raqami faqat raqamlardan iborat bo'lishi kerak.")
        if phone.startswith('998') and len(phone) == 12:
            return phone
        elif len(phone) == 9 and phone.isdigit():
            # O'zbekiston: 9 raqam (50, 71, 73, 90, 91, 93, 94, 95, 97, 98, 99 bilan boshlanishi mumkin)
            return '998' + phone
        else:
            raise serializers.ValidationError("Telefon raqami noto'g'ri formatda. 9 raqam kiriting (masalan: 501234567, 901234567)")
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Admin User Update Serializer"""
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True, min_length=3)
    
    class Meta:
        model = User
        fields = ['full_name', 'phone_number', 'password', 'organization',
                 'subscription_status', 'subscription_expiry', 'is_admin', 'is_active']
    
    def validate_phone_number(self, value):
        """Ensure phone number has 998 prefix"""
        phone = value.replace('+', '').replace(' ', '').replace('-', '').replace('(', '').replace(')', '').strip()
        if not phone.isdigit():
            raise serializers.ValidationError("Telefon raqami faqat raqamlardan iborat bo'lishi kerak.")
        if phone.startswith('998') and len(phone) == 12:
            return phone
        elif len(phone) == 9 and phone.isdigit():
            # O'zbekiston: 9 raqam (50, 71, 73, 90, 91, 93, 94, 95, 97, 98, 99 bilan boshlanishi mumkin)
            return '998' + phone
        else:
            raise serializers.ValidationError("Telefon raqami noto'g'ri formatda. 9 raqam kiriting (masalan: 501234567, 901234567)")
    
    def validate_password(self, value):
        """Password is optional, but if provided, must be at least 3 characters"""
        if value and len(value) < 3:
            raise serializers.ValidationError("Password must be at least 3 characters long.")
        return value
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password only if provided and not empty
        if password and password.strip():
            instance.set_password(password)
        
        instance.save()
        return instance


class AdminPasswordChangeSerializer(serializers.Serializer):
    """Admin Password Change Serializer"""
    password = serializers.CharField(required=True, min_length=3, write_only=True)
