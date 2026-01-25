"""
AI Services using Google Gemini API
"""
import google.generativeai as genai
from django.conf import settings
from .models import SystemSettings

def get_gemini_api_key():
    """Get Gemini API key: 1) SystemSettings (DB), 2) .env GEMINI_API_KEY, 3) default"""
    try:
        # Check if database is ready (avoid errors during migrations)
        from django.db import connection
        connection.ensure_connection()
        
        setting = SystemSettings.objects.get(key='GEMINI_API_KEY')
        return setting.value.strip()
    except (SystemSettings.DoesNotExist, Exception):
        # Fallback: .env GEMINI_API_KEY, then hardcoded default
        env_key = getattr(settings, 'GEMINI_API_KEY', None)
        if env_key and str(env_key).strip():
            return str(env_key).strip()
        return getattr(settings, 'GEMINI_API_KEY_DEFAULT', 'AIzaSyAdT9dte_zH8Akh9nisSdIVY16xUoInbW4')

# Configure Gemini - will be reconfigured when key is updated
_api_key = get_gemini_api_key()
if _api_key:
    try:
        genai.configure(api_key=_api_key)
    except Exception:
        pass  # Will be configured later

FALLBACK_QUOTES = [
    "Muvaffaqiyat tasodif emas, u mashaqqatli mehnat, qat'iyat va o'rganish natijasidir.",
    "Har bir kun - yangi imkoniyat. Bugun kechagidan yaxshiroq bo'lishga intiling.",
    "Katta maqsadlarga erishish uchun kichik, ammo barqaror qadamlar tashlang.",
    "Intizom - bu siz xohlagan narsa va siz hozir xohlayotgan narsa o'rtasidagi tanlovdir.",
    "Haqiqiy liderlik bu buyruq berish emas, balki o'rnak bo'lishdir.",
    "Muammolar - bu yechimini kutayotgan imkoniyatlardir.",
    "Vaqtni boshqarish - hayotni boshqarish demakdir."
]

FALLBACK_BRIEFING = """- Bugungi kun uchun eng ustuvor vazifalarni belgilab oling va diqqatni jamlang.
- Jamoa bilan qisqa "status-meeting" o'tkazib, ish jarayonini muvofiqlashtiring.
- Ijro intizomi va hujjatlar aylanishini nazorat qilishni unutmang."""


def get_model(model_name='gemini-1.5-flash'):
    """Get Gemini model instance"""
    api_key = get_gemini_api_key()
    if not api_key:
        raise Exception("GEMINI_API_KEY is not configured")
    
    # Always reconfigure to ensure latest key is used
    try:
        genai.configure(api_key=api_key)
    except Exception as e:
        raise Exception(f"Failed to configure Gemini API: {str(e)}")
    
    try:
        return genai.GenerativeModel(model_name)
    except Exception as e:
        raise Exception(f"Failed to get Gemini model: {str(e)}")


def get_document_instructions(doc_type, sector, organization):
    """Get document-specific instructions"""
    instructions_map = {
        'HISOBOT': {
            'specific': """USLUB: O'ta rasmiy, tahliliy, quruq faktlarga asoslangan.
MAQSAD: Rahbariyatga mavjud holat bo'yicha aniq, lo'nda va raqamli hisobot berish.
TALABLAR:
- Hissiy so'zlardan qoching (ajoyib, daxshatli va h.k).
- "Bajarildi", "Ta'minlandi", "Amalga oshirildi" kabi fe'llardan foydalaning.
- Muammolarni yashirmay, yechimlari bilan ko'rsating.""",
            'structure': """STRUKTURA:
1. Kirish (Asos: Prezident qarorlari yoki yuqori organ topshiriqlari).
2. Amalga oshirilgan ishlar (Statistika va jadvallar bilan).
3. Mavjud muammolar va kamchiliklar (Tanqidiy tahlil).
4. Taklif etilayotgan yechimlar.
5. Yakuniy xulosa va kutilayotgan natijalar."""
        },
        'AHBOROTNOMA': {
            'specific': """USLUB: Jurnalistik, informatsion, ommabop lekin rasmiy.
MAQSAD: Keng jamoatchilik yoki xodimlarni yangiliklardan xabardor qilish.
TALABLAR:
- Sarlavhalar jalb qiluvchi bo'lsin.
- Matn o'qish uchun oson va ravon bo'lsin.
- "Bizning maqsadimiz", "Kelajak rejalari" kabi ruhlantiruvchi qismlar bo'lsin.""",
            'structure': """STRUKTURA:
1. Bosh sarlavha (Katta va qalin).
2. "Hafta yangiliklari" yoki "Muhim voqealar" bloki.
3. Asosiy mavzu tahlili (Intervyu yoki hikoya elementlari bilan).
4. Infografika o'rniga matnli statistika.
5. Kelgusi rejalar e'loni."""
        },
        # Add more document types as needed
    }
    
    default = {
        'specific': """USLUB: Qat'iy byurokratik, huquqiy terminologiyaga asoslangan.
MAQSAD: Huquqiy oqibat tug'diruvchi hujjat yaratish.""",
        'structure': """STRUKTURA:
1. Asos (Qaysi qonun yoki qarorga asosan).
2. Buyruq qismi ("BUYURAMAN:" yoki "SO'RAYMAN:").
3. Bandma-band ko'rsatmalar.
4. Nazorat va ijro muddati."""
    }
    
    instructions = instructions_map.get(doc_type, default)
    
    system_instruction = f"""Siz "{organization}"ning Bosh Tahlilchisi va Strategik Maslahatchisisiz.

HUJJAT TURI: {doc_type}
SOHA: {sector}

{instructions['specific']}

FAYLLARNI TAHLIL QILISH (O'TA MUHIM):
Yuklangan fayllarni (PDF, Word, PPT, Rasm) shunchaki ko'rib chiqmang, ularni "ATOMAR DARAJADA" tahlil qiling.
1. Fayl ichidagi har bir jadval, raqam va statistikani matn ichiga singdiring.
2. Fayldagi ma'lumotlarga to'g'ridan-to'g'ri iqtibos keltiring.
3. Agar foydalanuvchi maqsadi bilan fayldagi ma'lumot mos kelmasa, fayldagi faktlarga ustunlik bering.

FORMATLASH:
- Muhim raqamlarni <span style="color: #dc2626; font-weight: bold;">qizil rangda</span> ajrating.
- Sarlavhalarni <h2>, <h3> taglari bilan belgilang.
- Ro'yxatlarni <ul> va <li> taglari bilan belgilang.
- Jadvallarni HTML <table> formatida yarating.

{instructions['structure']}
"""
    
    return system_instruction


def generate_document(doc_type, sector, topic, goal, files, use_search, organization):
    """Generate document using Gemini AI"""
    try:
        model = get_model('gemini-1.5-pro')  # Use Pro for better quality
        
        # Process files
        from .utils import process_files_to_parts
        parts = process_files_to_parts(files)
        
        # Add prompt
        prompt = f"""TASHKILOT: {organization}
MAVZU: {topic}

FOYDALANUVCHI MAQSADI VA TAFSILOTLAR:
{goal or ''}

TOPSHIRIQ IJROSI UCHUN QAT'IY BUYRUQLAR:
1. **Tarkib:** Hujjat {doc_type} standartlariga to'liq javob bersin. Hajmi yetarli darajada keng bo'lsin.
2. **Ma'lumotlar:** Fayllardan olingan ma'lumotlarni matn ichida "eriting".
3. **Til:** O'zbek tili (Kirill yoki Lotin alifbosi foydalanuvchi so'roviga qarab, default: Lotin).
"""
        
        # Get system instruction
        system_instruction = get_document_instructions(doc_type, sector, organization)
        
        # Convert parts to Gemini format
        gemini_parts = []
        
        # Add file contents first
        for part in parts:
            if 'text' in part:
                gemini_parts.append(part['text'])
            elif 'inline_data' in part:
                # For images, convert base64 to PIL Image
                import PIL.Image
                import io
                import base64
                try:
                    img_data = base64.b64decode(part['inline_data']['data'])
                    img = PIL.Image.open(io.BytesIO(img_data))
                    gemini_parts.append(img)
                except Exception as e:
                    # If image processing fails, add as text description
                    gemini_parts.append(f"[Rasm: {part.get('name', 'image')} - O'qib bo'lmadi]")
        
        # Add prompt at the end
        gemini_parts.append(prompt)
        
        # Generate content
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
        }
        
        # If system instruction is supported
        try:
            response = model.generate_content(
                gemini_parts,
                generation_config=generation_config,
                system_instruction=system_instruction
            )
        except TypeError:
            # Fallback if system_instruction not supported
            full_prompt = system_instruction + "\n\n" + "\n\n".join([p if isinstance(p, str) else "[Rasm]" for p in gemini_parts])
            response = model.generate_content(
                full_prompt,
                generation_config=generation_config
            )
        
        text = response.text if hasattr(response, 'text') else '<p>Xatolik yuz berdi.</p>'
        
        # Extract sources if available
        sources = []
        
        return {'text': text, 'sources': sources}
        
    except Exception as e:
        print(f"Error generating document: {str(e)}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Document generation failed: {str(e)}")


def refine_document(original_html, instruction, additional_files):
    """Refine document using Gemini AI"""
    try:
        model = get_model('gemini-1.5-pro')  # Use Pro for better quality
        
        from .utils import process_files_to_parts
        parts = process_files_to_parts(additional_files)
        
        refinement_prompt = f"""JORIY HTML HUJJAT:
{original_html}

--------------------------------------------------
FOYDALANUVCHI TALABI:
"{instruction}"
--------------------------------------------------

VAZIFA:
Hujjatni tahrirlash, yangi ma'lumotlar bilan boyitish va foydalanuvchi talabini bajarish.

UMUMIY QOIDALAR:
1. **Formatni Saqlash:** HTML strukturani (h2, h3, table) va rangli formatlashni saqlab qoling.
2. **Diplomatik Til:** Matnni "oliy darajadagi" rasmiy, akademik va byurokratik uslubda yozing.
3. **Kengaytirish:** Agar foydalanuvchi qisqartirishni so'ramagan bo'lsa, har bir yangi ma'lumotni batafsil tahlil qiling.
"""
        
        # Convert parts to Gemini format
        gemini_parts = []
        
        # Add file contents first
        for part in parts:
            if 'text' in part:
                gemini_parts.append(part['text'])
            elif 'inline_data' in part:
                # Convert base64 to PIL Image for images
                import PIL.Image
                import io
                import base64
                try:
                    img_data = base64.b64decode(part['inline_data']['data'])
                    img = PIL.Image.open(io.BytesIO(img_data))
                    gemini_parts.append(img)
                except:
                    gemini_parts.append(f"[Rasm - O'qib bo'lmadi]")
        
        # Add refinement prompt
        gemini_parts.append(refinement_prompt)
        
        response = model.generate_content(
            gemini_parts,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 8192,
            }
        )
        
        return response.text if hasattr(response, 'text') else original_html
        
    except Exception as e:
        print(f"Error refining document: {str(e)}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Document refinement failed: {str(e)}")


def send_chat_message(history, new_message):
    """Send chat message to Gemini"""
    try:
        model = get_model('gemini-1.5-flash')  # Flash for faster chat responses
        
        # Build conversation
        chat = model.start_chat(history=[])
        
        # Add history
        for msg in history:
            role = msg.get('role', 'user')
            text = msg.get('text', '')
            if role == 'user':
                chat.send_message(text)
            # Model responses are handled automatically
        
        # Send new message
        response = chat.send_message(new_message)
        
        text = response.text if hasattr(response, 'text') else ''
        
        return {'text': text, 'sources': []}
        
    except Exception as e:
        print(f"Error in chat: {str(e)}")
        raise Exception(f"Chat failed: {str(e)}")


def get_motivational_quote():
    """Get motivational quote"""
    try:
        model = get_model('gemini-1.5-flash')  # Flash for fast quotes
        prompt = "Davlat xizmatchilari va ofis xodimlari uchun har kuni yangi, takrorlanmas, o'ta ma'noli va kuchli motivatsion aforizm yoki hikmatli so'z yozing. Faqat bitta jumla bo'lsin."
        response = model.generate_content(prompt)
        return response.text if hasattr(response, 'text') else FALLBACK_QUOTES[0]
    except:
        import random
        return random.choice(FALLBACK_QUOTES)


def get_daily_briefing(organization):
    """Get daily briefing"""
    try:
        model = get_model('gemini-1.5-flash')  # Flash for fast briefings
        prompt = f"""Siz {organization} uchun strategik maslahatchisiz.
Bugungi sana uchun {organization} rahbariga 3 ta eng muhim strategik yo'nalish bo'yicha qisqa (2-3 jumla) "Kunlik Brifing" (Dayjest) tayyorla.
Uslub: Jiddiy, tahliliy va ilhomlantiruvchi.
Format: Ro'yxat shaklida (HTML ishlatma, shunchaki text)."""
        response = model.generate_content(prompt)
        return response.text if hasattr(response, 'text') else FALLBACK_BRIEFING
    except:
        return FALLBACK_BRIEFING


def analyze_image(file_path, mime_type, prompt):
    """Analyze image using Gemini Vision"""
    try:
        import PIL.Image
        model = get_model('gemini-1.5-flash')  # Flash supports vision
        
        # Load image
        img = PIL.Image.open(file_path)
        
        # Generate content with image and prompt
        response = model.generate_content([
            img,
            prompt or "Tasvirda nimalar aks etgan?"
        ])
        
        return response.text if hasattr(response, 'text') else ''
    except Exception as e:
        print(f"Error analyzing image: {str(e)}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Image analysis failed: {str(e)}")
