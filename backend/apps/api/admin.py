from django.contrib import admin
from django.contrib import messages
from django.contrib.auth.forms import ReadOnlyPasswordHashField, AuthenticationForm
from django import forms
from django.core.exceptions import ValidationError
from .models import User, SavedDocument, SystemSettings


class PhoneNumberAuthenticationForm(AuthenticationForm):
    """Custom login form that uses phone_number instead of username"""
    username = forms.CharField(
        label="Telefon Raqam",
        max_length=20,
        widget=forms.TextInput(attrs={'autofocus': True, 'placeholder': '998948788878'})
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].label = "Telefon Raqam"
        self.fields['password'].label = "Parol"


class CustomUserChangeForm(forms.ModelForm):
    """Custom form for changing user"""
    password = ReadOnlyPasswordHashField(
        label="Parol",
        help_text="Parolni o'zgartirish uchun <a href=\"../password/\">bu yerga</a> bosing."
    )
    
    class Meta:
        model = User
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove password field from form if user is being edited
        if self.instance and self.instance.pk:
            self.fields['password'].required = False


class CustomUserCreationForm(forms.ModelForm):
    """Custom form for creating user"""
    password1 = forms.CharField(
        label="Parol",
        widget=forms.PasswordInput,
        help_text="Parol kamida 3 belgidan iborat bo'lishi kerak."
    )
    password2 = forms.CharField(
        label="Parolni tasdiqlash",
        widget=forms.PasswordInput,
        help_text="Parolni tasdiqlash uchun qayta kiriting."
    )
    
    class Meta:
        model = User
        fields = ('phone_number', 'full_name', 'organization')
    
    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise ValidationError("Parollar mos kelmadi.")
        return password2
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    
    list_display = ['full_name', 'phone_number', 'organization', 'subscription_status', 'is_admin', 'is_active', 'date_joined']
    list_filter = ['subscription_status', 'is_admin', 'is_active', 'date_joined']
    search_fields = ['full_name', 'phone_number', 'organization']
    ordering = ['-date_joined']
    readonly_fields = ['date_joined', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('phone_number',)
        }),
        ('Personal Info', {
            'fields': ('full_name', 'organization')
        }),
        ('Subscription', {
            'fields': ('subscription_status', 'subscription_expiry')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_admin', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important dates', {
            'fields': ('date_joined', 'updated_at')
        }),
        ('Additional', {
            'fields': ('history',),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'full_name', 'organization', 'password1', 'password2', 'is_staff', 'is_admin', 'is_active'),
        }),
    )
    
    def get_form(self, request, obj=None, **kwargs):
        """
        Use special form during user creation
        """
        defaults = {}
        if obj is None:
            defaults['form'] = self.add_form
        defaults.update(kwargs)
        return super().get_form(request, obj, **defaults)
    
    def save_model(self, request, obj, form, change):
        """
        Save user with password hashing
        """
        if not change:  # Creating new user
            if hasattr(form, 'cleaned_data') and form.cleaned_data.get('password1'):
                obj.set_password(form.cleaned_data['password1'])
        elif change and 'password' in form.changed_data:
            # Password was changed in edit form
            if form.cleaned_data.get('password'):
                obj.set_password(form.cleaned_data['password'])
        super().save_model(request, obj, form, change)


@admin.register(SavedDocument)
class SavedDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'doc_type', 'created_at']
    list_filter = ['doc_type', 'created_at']
    search_fields = ['title', 'user__full_name']
    readonly_fields = ['created_at']


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ['key', 'value_preview', 'description', 'updated_at', 'updated_by']
    list_filter = ['updated_at']
    search_fields = ['key', 'description']
    readonly_fields = ['updated_at', 'updated_by']
    
    fieldsets = (
        ('Setting Information', {
            'fields': ('key', 'value', 'description')
        }),
        ('Metadata', {
            'fields': ('updated_at', 'updated_by'),
            'classes': ('collapse',)
        }),
    )
    
    def value_preview(self, obj):
        """Show truncated value in list view"""
        if len(obj.value) > 50:
            return f"{obj.value[:47]}..."
        return obj.value
    value_preview.short_description = 'Value'
    
    def save_model(self, request, obj, form, change):
        """Save the user who updated the setting"""
        if change:
            obj.updated_by = request.user
        super().save_model(request, obj, form, change)
        messages.success(request, f'Setting "{obj.key}" has been updated successfully.')
