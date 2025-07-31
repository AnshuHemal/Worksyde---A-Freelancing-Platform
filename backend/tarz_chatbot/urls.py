from django.urls import path
from . import views

urlpatterns = [
    path('message/', views.tarzbot_message, name='tarzbot_message'),
    path('history/', views.tarzbot_history, name='tarzbot_history'),
    path('sessions/', views.tarzbot_sessions, name='tarzbot_sessions'),
    path('new_session/', views.tarzbot_new_session, name='tarzbot_new_session'),
    path('delete-session/', views.tarzbot_delete_session, name='tarzbot_delete_session'),
    path('generate-title/', views.tarzbot_generate_title, name='tarzbot_generate_title'),
    path('update-session-title/', views.tarzbot_update_session_title, name='tarzbot_update_session_title'),
] 