from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Expect room_name to be the room ID, like "senderid_receiverid"
    re_path(r"ws/chat/(?P<room_name>[\w\d_]+)/$", consumers.ChatConsumer.as_asgi()),
    re_path(r"ws/notify/(?P<user_id>[^/]+)/$", consumers.NotificationConsumer.as_asgi()),
]
