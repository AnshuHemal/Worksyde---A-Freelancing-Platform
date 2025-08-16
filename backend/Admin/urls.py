from django.urls import path
from . import views

urlpatterns = [
    # Existing endpoints
    path('under-review-requests/', views.get_under_review_users_summary, name='under_review_summary'),
    path('under-review-requests-by-userid/', views.get_under_review_requests, name='under_review_detail'),
    path('test-requests/', views.test_requests_endpoint, name='test_requests'),
    path('requests/start-review/<str:request_id>/', views.start_reviewing_request, name='start_reviewing'),
    path('requests/stop-review/<str:request_id>/', views.stop_reviewing_request, name='stop_reviewing'),
    path('requests/review/<str:request_id>/', views.set_review_msg_and_send_user_email, name='set_review_and_notify'),
    
    # New role-based endpoints
    # Admin and Superadmin can access
    path('freelancers/', views.get_all_freelancers, name='get_all_freelancers'),
    path('clients/', views.get_all_clients, name='get_all_clients'),
    
    # Superadmin only endpoints
    path('admins/', views.get_all_admins, name='get_all_admins'),
    path('skills/', views.get_all_skills, name='get_all_skills'),
    path('skills/create/', views.create_skill, name='create_skill'),
    path('specialities/', views.get_all_specialities, name='get_all_specialities'),
    path('specialities/create/', views.create_speciality, name='create_speciality'),
              
    # Ban/Unban endpoints
    path('ban-user/', views.ban_user, name='ban_user'),
    path('unban-user/', views.unban_user, name='unban_user'),
    
    # User status endpoints
    path('check-user-ban-status/', views.check_user_ban_status, name='check_user_ban_status'),
    

]
