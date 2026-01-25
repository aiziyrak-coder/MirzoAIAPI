from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Q
from django.conf import settings
from datetime import timedelta
import json
import os
import requests

from .models import User, SavedDocument, SystemSettings
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    SavedDocumentSerializer, DocumentHistorySerializer,
    GenerateDocumentSerializer, RefineDocumentSerializer,
    ChatMessageSerializer, SubscriptionUpdateSerializer,
    AdminSubscriptionUpdateSerializer, GeminiApiKeySerializer,
    AdminUserCreateSerializer, AdminUserUpdateSerializer, AdminPasswordChangeSerializer
)
from .permissions import IsAdminUser, IsActiveSubscription
from .services import (
    generate_document, refine_document, send_chat_message,
    get_motivational_quote, get_daily_briefing, analyze_image,
    FALLBACK_QUOTES
)
from .telegram_service import send_payment_notification, handle_telegram_callback, send_telegram_message
from .telegram_service import TELEGRAM_ADMIN_ID


class AuthViewSet(viewsets.ViewSet):
    """Authentication endpoints"""
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Register new user"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'token': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'error': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """Login user"""
        try:
            serializer = UserLoginSerializer(data=request.data)
            if serializer.is_valid():
                phone_number = serializer.validated_data['phone_number']
                password = serializer.validated_data['password']
                
                # Ensure phone number format (remove +, ensure starts with 998)
                phone_number = phone_number.replace('+', '').replace(' ', '').strip()
                if not phone_number.startswith('998'):
                    if phone_number.startswith('9') and len(phone_number) == 9:
                        phone_number = '998' + phone_number
                    else:
                        import re
                        phone_number = '998' + re.sub(r'\D', '', phone_number)
                
                # Try to authenticate
                user = authenticate(request, username=phone_number, password=password)
                
                if user:
                    user.check_subscription_expiry()
                    refresh = RefreshToken.for_user(user)
                    
                    return Response({
                        'success': True,
                        'token': str(refresh.access_token),
                        'user': UserSerializer(user).data
                    })
                
                return Response({
                    'success': False,
                    'error': "Raqam yoki parol noto'g'ri."
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            print(f"Login error: {str(e)}")
            print(traceback.format_exc())
            return Response({
                'success': False,
                'error': f'Server xatolik: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def admin(self, request):
        """Admin login"""
        secret = request.data.get('secret')
        
        if secret != 'Xazratbro':
            return Response({
                'success': False,
                'error': "Parol noto'g'ri!"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Find or create admin user
        admin_user, created = User.objects.get_or_create(
            phone_number='admin',
            defaults={
                'full_name': 'Super Admin',
                'organization': 'SaaS Platform',
                'subscription_status': 'ACTIVE',
                'is_admin': True,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        
        if not created:
            admin_user.is_admin = True
            admin_user.subscription_status = 'ACTIVE'
            admin_user.save()
        
        refresh = RefreshToken.for_user(admin_user)
        
        return Response({
            'success': True,
            'token': str(refresh.access_token),
            'user': UserSerializer(admin_user).data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user"""
        user = request.user.check_subscription_expiry()
        return Response({
            'success': True,
            'user': UserSerializer(user).data
        })


class DocumentViewSet(viewsets.ViewSet):
    """Document generation and management endpoints"""
    permission_classes = [IsAuthenticated, IsActiveSubscription]
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsActiveSubscription])
    def generate(self, request):
        """Generate document"""
        serializer = GenerateDocumentSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user.check_subscription_expiry()
        
        files = request.FILES.getlist('files', [])
        doc_type = serializer.validated_data['doc_type']
        sector = serializer.validated_data['sector']
        topic = serializer.validated_data['topic']
        goal = serializer.validated_data.get('goal', '')
        use_search = serializer.validated_data.get('use_search', True)
        organization = serializer.validated_data.get('organization', user.organization)
        
        try:
            result = generate_document(
                doc_type=doc_type,
                sector=sector,
                topic=topic,
                goal=goal,
                files=files,
                use_search=use_search,
                organization=organization
            )
            
            # Save to history
            history_item = {
                'id': str(timezone.now().timestamp()),
                'title': topic,
                'type': doc_type,
                'date': timezone.now().isoformat(),
                'content': result['text']
            }
            
            user.history = [history_item] + (user.history or [])[:99]  # Keep last 100
            user.save()
            
            return Response({
                'success': True,
                'text': result['text'],
                'sources': result.get('sources', [])
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsActiveSubscription])
    def refine(self, request):
        """Refine document"""
        serializer = RefineDocumentSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        original_html = serializer.validated_data['original_html']
        instruction = serializer.validated_data.get('instruction', '')
        additional_files = request.FILES.getlist('additional_files', [])
        
        if not instruction and not additional_files:
            return Response({
                'success': False,
                'error': "Instruction yoki qo'shimcha fayllar kerak."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            refined_text = refine_document(original_html, instruction, additional_files)
            
            return Response({
                'success': True,
                'text': refined_text
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def history(self, request):
        """Get document history"""
        user = request.user
        history = user.history or []
        
        return Response({
            'success': True,
            'history': history
        })
    
    @action(detail=False, methods=['delete'], permission_classes=[IsAuthenticated], url_path='history/(?P<doc_id>[^/.]+)')
    def delete_history_item(self, request, doc_id=None):
        """Delete history item"""
        user = request.user
        history = user.history or []
        
        user.history = [item for item in history if item.get('id') != doc_id]
        user.save()
        
        return Response({
            'success': True,
            'message': 'Document deleted from history'
        })


class UserViewSet(viewsets.ViewSet):
    """User management endpoints"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get', 'put'], url_path='profile')
    def profile(self, request):
        """Get or update user profile"""
        user = request.user.check_subscription_expiry()
        
        if request.method == 'PUT':
            user.full_name = request.data.get('full_name', user.full_name)
            user.organization = request.data.get('organization', user.organization)
            user.save()
        
        return Response({
            'success': True,
            'user': UserSerializer(user).data
        })
        """Update user profile"""
        user = request.user
        user.full_name = request.data.get('full_name', user.full_name)
        user.organization = request.data.get('organization', user.organization)
        user.save()
        
        return Response({
            'success': True,
            'user': UserSerializer(user).data
        })
    
    @action(detail=False, methods=['post'])
    def subscription(self, request):
        """Update subscription (upload receipt)"""
        try:
            user = request.user
            print(f"Subscription endpoint called by user: {user.id} ({user.full_name})")
            print(f"Request FILES: {list(request.FILES.keys())}")
            print(f"Request data: {request.data}")
            
            # If receipt file is uploaded, set status to PENDING
            receipt_file = request.FILES.get('receipt')
            if receipt_file:
                print(f"Receipt file received: {receipt_file.name}, size: {receipt_file.size}")
                
                # Set status to PENDING
                user.subscription_status = 'PENDING'
                
                # Save receipt file
                receipt_dir = os.path.join(settings.MEDIA_ROOT, 'receipts')
                os.makedirs(receipt_dir, exist_ok=True)
                
                # Generate unique filename
                file_extension = os.path.splitext(receipt_file.name)[1] or '.jpg'
                receipt_filename = f"receipt_{user.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}{file_extension}"
                receipt_path = os.path.join(receipt_dir, receipt_filename)
                
                # Save file
                with open(receipt_path, 'wb+') as destination:
                    for chunk in receipt_file.chunks():
                        destination.write(chunk)
                
                print(f"Receipt file saved to: {receipt_path}")
                print(f"File exists: {os.path.exists(receipt_path)}")
                
                # Save receipt filename to user
                user.receipt_file_name = receipt_filename
                user.save()
                print(f"User receipt_file_name saved: {user.receipt_file_name}")
                
                # Send notification to Telegram group
                try:
                    result = send_payment_notification(user, receipt_path)
                    if result:
                        print(f"Telegram notification sent successfully. Message ID: {result}")
                    else:
                        print("Warning: Telegram notification failed (check logs above)")
                except Exception as e:
                    import traceback
                    print(f"Error sending Telegram notification: {str(e)}")
                    print(traceback.format_exc())
                    # Continue even if Telegram fails
            else:
                print("Warning: No receipt file in request")
                user.subscription_status = 'PENDING'
                user.save()
        
            response_data = {
                'success': True,
                'message': 'To\'lov cheki qabul qilindi. Administratorlar tez orada tasdiqlaydi.',
                'user': UserSerializer(user).data
            }
            print(f"Returning response: {response_data}")
            return Response(response_data)
        except Exception as e:
            import traceback
            print(f"Error in subscription endpoint: {str(e)}")
            print(traceback.format_exc())
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminViewSet(viewsets.ViewSet):
    """Admin endpoints"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    @action(detail=False, methods=['get', 'post'])
    def users(self, request):
        """Get all users or create new user"""
        if request.method == 'GET':
            # Get all users with search and filter support
            search = request.query_params.get('search', None)
            status_filter = request.query_params.get('status', None)
            
            users = User.objects.all()
            
            if search:
                users = users.filter(
                    Q(full_name__icontains=search) |
                    Q(phone_number__icontains=search) |
                    Q(organization__icontains=search)
                )
            
            if status_filter:
                users = users.filter(subscription_status=status_filter)
            
            users = users.order_by('-date_joined')
            serializer = UserSerializer(users, many=True)
            
            return Response({
                'success': True,
                'count': users.count(),
                'users': serializer.data
            })
        
        elif request.method == 'POST':
            # Create new user
            serializer = AdminUserCreateSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if phone number already exists
            phone_number = serializer.validated_data.get('phone_number')
            if User.objects.filter(phone_number=phone_number).exists():
                return Response({
                    'success': False,
                    'error': {'phone_number': ['User with this phone number already exists']}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = serializer.save()
            
            return Response({
                'success': True,
                'message': 'User created successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['put'], url_path='users/(?P<user_id>[^/.]+)/subscription')
    def update_user_subscription(self, request, user_id=None):
        """Update user subscription status"""
        serializer = AdminSubscriptionUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            status_value = serializer.validated_data['status']
            
            user.subscription_status = status_value
            
            if status_value == 'ACTIVE':
                user.subscription_expiry = timezone.now() + timedelta(days=30)
                # Clear receipt file name when approved
                user.receipt_file_name = None
            elif status_value == 'NONE':
                user.subscription_expiry = None
                # Clear receipt file name when rejected
                user.receipt_file_name = None
            # Keep receipt_file_name if status is PENDING
            
            user.save()
            
            return Response({
                'success': True,
                'message': 'Subscription updated successfully',
                'user': UserSerializer(user).data
            })
            
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get admin statistics"""
        pending_count = User.objects.filter(subscription_status='PENDING').count()
        active_count = User.objects.filter(subscription_status='ACTIVE').count()
        none_count = User.objects.filter(subscription_status='NONE').count()
        total_users = User.objects.count()
        active_accounts = User.objects.filter(is_active=True).count()
        admin_count = User.objects.filter(is_admin=True).count()
        total_earnings = active_count * 25000
        
        # Recent users (last 7 days)
        from datetime import timedelta
        recent_users = User.objects.filter(
            date_joined__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        return Response({
            'success': True,
            'stats': {
                'total_users': total_users,
                'pending_count': pending_count,
                'active_subscription_count': active_count,
                'none_subscription_count': none_count,
                'active_accounts': active_accounts,
                'admin_count': admin_count,
                'recent_users_7days': recent_users,
                'total_earnings': total_earnings
            }
        })
    
    @action(detail=False, methods=['get', 'put'], url_path='settings/gemini-api-key')
    def gemini_api_key(self, request):
        """Get or update Gemini API Key (Super Admin only)"""
        if request.method == 'GET':
            # Get current API key (masked for security)
            try:
                setting = SystemSettings.objects.get(key='GEMINI_API_KEY')
                masked_key = setting.value[:10] + '*' * (len(setting.value) - 14) + setting.value[-4:] if len(setting.value) > 14 else '*' * len(setting.value)
                return Response({
                    'success': True,
                    'api_key_masked': masked_key,
                    'updated_at': setting.updated_at,
                    'updated_by': setting.updated_by.full_name if setting.updated_by else None
                })
            except SystemSettings.DoesNotExist:
                # If not in database, create it with default value
                from django.conf import settings as django_settings
                default_key = getattr(django_settings, 'GEMINI_API_KEY_DEFAULT', 'AIzaSyAdT9dte_zH8Akh9nisSdIVY16xUoInbW4')
                
                # Create default setting if it doesn't exist
                SystemSettings.objects.get_or_create(
                    key='GEMINI_API_KEY',
                    defaults={
                        'value': default_key,
                        'description': 'Google Gemini API Key for AI services (Default)'
                    }
                )
                
                masked_key = default_key[:10] + '*' * (len(default_key) - 14) + default_key[-4:] if len(default_key) > 14 else '*' * len(default_key)
                return Response({
                    'success': True,
                    'api_key_masked': masked_key,
                    'is_default': True,
                    'message': 'Using default API key. Update it to use a custom key.'
                })
        
        elif request.method == 'PUT':
            # Update API key
            serializer = GeminiApiKeySerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            api_key = serializer.validated_data['api_key'].strip()
            
            # Save to database
            setting, created = SystemSettings.objects.update_or_create(
                key='GEMINI_API_KEY',
                defaults={
                    'value': api_key,
                    'description': 'Google Gemini API Key for AI services',
                    'updated_by': request.user
                }
            )
            
            # Reconfigure Gemini API with new key and test it
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                # Test the key by trying to create a model instance
                test_model = genai.GenerativeModel('gemini-1.5-flash')
                # If successful, the key is valid (we don't need to call it, just instantiate)
            except Exception as e:
                return Response({
                    'success': False,
                    'error': f'Invalid API key or connection error: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'success': True,
                'message': 'Gemini API Key updated successfully',
                'updated_at': setting.updated_at
            })
    
    @action(detail=False, methods=['get'], url_path='users/(?P<user_id>[^/.]+)/receipt')
    def get_user_receipt(self, request, user_id=None):
        """Get user receipt image"""
        try:
            user = User.objects.get(id=user_id)
            
            receipt_dir = os.path.join(settings.MEDIA_ROOT, 'receipts')
            receipt_filename = None
            receipt_path = None
            
            # First, try to use saved receipt_file_name
            if user.receipt_file_name:
                receipt_filename = user.receipt_file_name
                receipt_path = os.path.join(receipt_dir, receipt_filename)
                if not os.path.exists(receipt_path):
                    receipt_filename = None
                    receipt_path = None
            
            # If not found, search for receipt files by user ID pattern
            if not receipt_path or not os.path.exists(receipt_path):
                if os.path.exists(receipt_dir):
                    import glob
                    # Search for receipt files matching pattern: receipt_{user_id}_*
                    pattern = os.path.join(receipt_dir, f"receipt_{user_id}_*")
                    matching_files = glob.glob(pattern)
                    if matching_files:
                        # Get the most recent file
                        receipt_path = max(matching_files, key=os.path.getctime)
                        receipt_filename = os.path.basename(receipt_path)
                        # Update user's receipt_file_name for future reference
                        user.receipt_file_name = receipt_filename
                        user.save(update_fields=['receipt_file_name'])
            
            if not receipt_path or not os.path.exists(receipt_path):
                return Response({
                    'success': False,
                    'error': 'Receipt not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Return receipt URL
            receipt_url = f"{request.scheme}://{request.get_host()}{settings.MEDIA_URL}receipts/{receipt_filename}"
            
            return Response({
                'success': True,
                'receipt_url': receipt_url,
                'file_name': receipt_filename
            })
            
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get', 'put', 'delete'], url_path='users/(?P<user_id>[^/.]+)')
    def user_detail(self, request, user_id=None):
        """Get, update or delete specific user"""
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'GET':
            # Get user details
            serializer = UserSerializer(user)
            return Response({
                'success': True,
                'user': serializer.data
            })
        
        elif request.method == 'PUT':
            # Update user
            # Check phone number uniqueness before validation
            new_phone = request.data.get('phone_number')
            if new_phone and new_phone != user.phone_number:
                if User.objects.filter(phone_number=new_phone).exclude(id=user_id).exists():
                    return Response({
                        'success': False,
                        'error': {'phone_number': ['User with this phone number already exists']}
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            updated_user = serializer.save()
            
            return Response({
                'success': True,
                'message': 'User updated successfully',
                'user': UserSerializer(updated_user).data
            })
        
        elif request.method == 'DELETE':
            # Delete user
            user_data = UserSerializer(user).data
            user.delete()
            
            return Response({
                'success': True,
                'message': 'User deleted successfully',
                'deleted_user': user_data
            }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['put'], url_path='users/(?P<user_id>[^/.]+)/password')
    def change_user_password(self, request, user_id=None):
        """Change user password"""
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = AdminPasswordChangeSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        password = serializer.validated_data['password']
        user.set_password(password)
        user.save()
        
        return Response({
            'success': True,
            'message': 'Password changed successfully'
        })


class AIViewSet(viewsets.ViewSet):
    """AI service endpoints"""
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def quote(self, request):
        """Get motivational quote"""
        try:
            quote = get_motivational_quote()
            return Response({
                'success': True,
                'quote': quote
            })
        except Exception as e:
            import random
            return Response({
                'success': True,
                'quote': random.choice(FALLBACK_QUOTES)
            })
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def chat(self, request):
        """Chat with AI"""
        serializer = ChatMessageSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        history = serializer.validated_data.get('history', [])
        message = serializer.validated_data['message']
        
        try:
            result = send_chat_message(history, message)
            return Response({
                'success': True,
                'text': result['text'],
                'sources': result.get('sources', [])
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def briefing(self, request):
        """Get daily briefing"""
        user = request.user.check_subscription_expiry()
        
        try:
            briefing_text = get_daily_briefing(user.organization)
            
            # Parse briefing into array
            briefing_items = briefing_text.split('\n-')
            clean_briefing = [item.strip() for item in briefing_items if item.strip()]
            
            if not clean_briefing:
                clean_briefing = [briefing_text]
            
            return Response({
                'success': True,
                'briefing': clean_briefing
            })
        except Exception as e:
            return Response({
                'success': True,
                'briefing': ["- Bugungi kun uchun eng ustuvor vazifalarni belgilab oling va diqqatni jamlang."]
            })
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsActiveSubscription])
    def analyze_image(self, request):
        """Analyze image"""
        if 'image' not in request.FILES:
            return Response({
                'success': False,
                'error': 'Image file is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        image_file = request.FILES['image']
        prompt = request.data.get('prompt', "Tasvirda nimalar aks etgan?")
        
        # Save file temporarily
        import tempfile
        import os
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(image_file.name)[1]) as tmp_file:
            for chunk in image_file.chunks():
                tmp_file.write(chunk)
            tmp_path = tmp_file.name
        
        try:
            result = analyze_image(tmp_path, image_file.content_type, prompt)
            return Response({
                'success': True,
                'text': result
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)


@api_view(['POST'])
@permission_classes([AllowAny])
def telegram_webhook(request):
    """
    Telegram webhook endpoint for handling bot updates
    Telegram sends updates in format: {"update_id": ..., "callback_query": {...}}
    """
    try:
        # Telegram sends updates as JSON
        import json
        if hasattr(request, 'data') and request.data:
            data = request.data
        else:
            body = request.body.decode('utf-8')
            data = json.loads(body) if body else {}
        
        print(f"Telegram webhook received: {json.dumps(data, indent=2)}")
        
        # Telegram sends updates wrapped in 'update' object
        # Check if it's a direct callback_query or wrapped in update
        if 'update' in data:
            data = data['update']
            print(f"Extracted update data: {json.dumps(data, indent=2)}")
        
        # Handle callback query (button clicks)
        if 'callback_query' in data:
            callback_query = data['callback_query']
            callback_data = callback_query.get('data', '')
            callback_id = callback_query.get('id', '')
            from_user = callback_query.get('from', {})
            user_id = str(from_user.get('id', ''))
            
            # Check if user is admin
            if user_id != TELEGRAM_ADMIN_ID:
                # Answer callback with error
                requests.post(
                    f"https://api.telegram.org/bot{os.getenv('TELEGRAM_BOT_TOKEN', '')}/answerCallbackQuery",
                    json={
                        'callback_query_id': callback_id,
                        'text': 'Sizda bu amalni bajarish huquqi yo\'q!',
                        'show_alert': True
                    }
                )
                return Response({'success': False, 'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
            # Handle callback
            print(f"Processing callback: {callback_data}, from user: {user_id}, admin_id: {TELEGRAM_ADMIN_ID}")
            success, message = handle_telegram_callback(callback_data, user_id)
            print(f"Callback result: success={success}, message={message}")
            
            # Answer callback query
            bot_token = os.getenv('TELEGRAM_BOT_TOKEN', '')
            if bot_token:
                # Answer callback
                requests.post(
                    f"https://api.telegram.org/bot{bot_token}/answerCallbackQuery",
                    json={
                        'callback_query_id': callback_id,
                        'text': 'Amal bajarildi!' if success else 'Xatolik yuz berdi!',
                        'show_alert': False
                    }
                )
                
                # Edit message to show result
                message_obj = callback_query.get('message', {})
                chat_id = message_obj.get('chat', {}).get('id', '')
                message_id = message_obj.get('message_id', '')
                
                if chat_id and message_id:
                    # Get caption if it's a photo message, otherwise get text
                    original_text = message_obj.get('caption', '') or message_obj.get('text', '')
                    edit_text = original_text + f"\n\n<b>Status:</b> {message}"
                    edit_response = requests.post(
                        f"https://api.telegram.org/bot{bot_token}/editMessageCaption",
                        json={
                            'chat_id': chat_id,
                            'message_id': message_id,
                            'caption': edit_text,
                            'parse_mode': 'HTML'
                        }
                    )
                    print(f"Edit message response: {edit_response.status_code}, {edit_response.text}")
            
            return Response({
                'success': success,
                'message': message
            })
        
        # Handle regular messages (optional)
        elif 'message' in data:
            # You can add message handling here if needed
            pass
        
        return Response({'success': True})
        
    except Exception as e:
        print(f"Telegram webhook error: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
