# chats/urls.py
from django.urls import path
from .views import chat_view, hire_notify, chat_rooms_view, mark_messages_read, chat_file_upload

urlpatterns = [
    path("", chat_view, name="chat"),
    path('hire-notify/', hire_notify, name='hire_notify'),
    path('rooms/', chat_rooms_view, name='chat_rooms'),
    path('mark-read/', mark_messages_read, name='mark_messages_read'),
    path('upload/', chat_file_upload, name='chat_file_upload'),
]
