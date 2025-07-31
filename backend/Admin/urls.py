from django.urls import path
from . import views

urlpatterns = [
    path('under-review-requests/', views.get_under_review_users_summary, name='under_review_summary'),
    path('under-review-requests-by-userid/', views.get_under_review_requests, name='under_review_detail'),
    path('requests/review/<str:request_id>/', views.set_review_msg_and_send_user_email, name='set_review_and_notify'),
]
