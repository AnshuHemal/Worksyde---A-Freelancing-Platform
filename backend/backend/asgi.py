"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import django
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from chats import routing  # ✅ Import routing correctly (not as string)

# Set environment for Django
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE", "backend.settings"
)  # ✅ Make sure 'ChatApp' is your Django project folder
django.setup()

# Optional: MongoDB setup (if used globally)
from pymongo import MongoClient
from django.conf import settings

mongo_client = MongoClient(
    "mongodb+srv://whiteturtle1:dvIw4evFuDVOzea3@cluster0.1e4vx.mongodb.net/worksyde?retryWrites=true&w=majority&appName=Cluster0"
)
mongo_db = mongo_client.get_database("worksyde2")

settings.MONGO_CLIENT = mongo_client
settings.MONGO_DB = mongo_db

# Core ASGI app
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(
            URLRouter(
                routing.websocket_urlpatterns  # ✅ Pass the actual list, not string
            )
        ),
    }
)
