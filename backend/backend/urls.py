from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "healthy", "message": "Worksyde API is running"})

urlpatterns = [
    path("", health_check, name="health_check"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("Auth.urls")),
    path("api/admin/auth/", include("Admin.urls")),
    path("api/chats/", include("chats.urls")),
    path("api/ai-resumes/", include("Resume.urls")),
    path("api/tarzbot/", include("tarz_chatbot.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
