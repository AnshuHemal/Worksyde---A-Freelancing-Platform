from django.urls import path
from . import views

urlpatterns = [
    path('', views.create_resume, name='create_resume'),  # POST
    path('', views.get_user_resumes, name='get_user_resumes'),  # GET
    path('<str:resume_id>/', views.get_resume_by_id, name='get_resume_by_id'),  # GET
    path('<str:resume_id>/', views.update_resume, name='update_resume'),  # PUT
    # path('<str:resume_id>/upload-images/', views.upload_resume_images, name='upload_resume_images'),  # PUT
    path('<str:resume_id>/', views.delete_resume, name='delete_resume'),  # DELETE
] 