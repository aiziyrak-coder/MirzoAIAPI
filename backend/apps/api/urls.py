from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthViewSet, DocumentViewSet, UserViewSet, AdminViewSet, AIViewSet, telegram_webhook

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'documents', DocumentViewSet, basename='documents')
router.register(r'users', UserViewSet, basename='users')
router.register(r'admin', AdminViewSet, basename='admin')
router.register(r'ai', AIViewSet, basename='ai')

urlpatterns = [
    path('', include(router.urls)),
    path('telegram/webhook/', telegram_webhook, name='telegram_webhook'),
]
