"""
URL configuration for mirzoai project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

# Customize admin site (import after admin to avoid circular import)
def setup_admin():
    from apps.api.admin import PhoneNumberAuthenticationForm
    admin.site.login_form = PhoneNumberAuthenticationForm
    admin.site.site_header = "Mirzo AI Admin Panel"
    admin.site.site_title = "Mirzo AI Admin"
    admin.site.index_title = "Boshqaruv Paneli"

setup_admin()

@require_http_methods(["GET"])
def root_view(request):
    """Root URL view - redirect to API or return info"""
    return JsonResponse({
        'message': 'Mirzo AI API',
        'version': '1.0.0',
        'endpoints': {
            'api': '/api/',
            'admin': '/admin/',
            'health': '/health'
        }
    })

urlpatterns = [
    path('', root_view, name='root'),
    path('admin/', admin.site.urls),
    path('api/', include('apps.api.urls')),
]

# Health check endpoint
from django.http import JsonResponse
from django.utils import timezone as tz

def health_check(request):
    return JsonResponse({'status': 'ok', 'timestamp': tz.now().isoformat()})

urlpatterns += [
    path('health', health_check),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
