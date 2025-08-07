from django.urls import path
from . import views

urlpatterns = [
    path('', views.resume_list, name='resume_list'),  # GET (list) and POST (create)
    path('<str:resume_id>/', views.resume_detail, name='resume_detail'),  # GET, PUT, DELETE
] 