from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """Custom permission to check if user is admin"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsActiveSubscription(permissions.BasePermission):
    """Custom permission to check if user has active subscription"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admins always have access
        if request.user.is_admin:
            return True
        
        # Check subscription status
        user = request.user.check_subscription_expiry()
        return user.subscription_status == 'ACTIVE'
