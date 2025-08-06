from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from mongoengine.errors import DoesNotExist
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.utils.timezone import make_aware, is_naive, get_default_timezone
from django.conf import settings
from django.db import models
from Auth.models import (
    User,
    Category,
    Speciality,
    Skill,
    Resume,
    Requests,
    WorkExperience,
    Education,
    OtherExperience,
    JobPosts,
    JobProposals,
    ProposalAttachment,
    Otp,
    PhoneOtp,
    JobAttachment,
    Language,
    PaymentCard,
    PayPalAccount,
    Company,
)
from .serializers import (
    EducationSerializer,
    RequestProfileSerializer,
    JobPostSerializer,
    JobProposalSerializer,
)
from Auth.decorators import verify_token
from Admin.emails import send_otp_email, send_under_review_email
from django.http import HttpResponse
import jwt
from datetime import datetime, timedelta
import json
from bson import ObjectId
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.mail import EmailMessage
import random
import traceback
import time
from twilio.rest import Client
import uuid


def send_otp_sms(phone_number, otp_code):
    """
    Send OTP via SMS using Twilio
    Returns: (success: bool, message: str)
    """
    try:
        # Get Twilio credentials from settings
        account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
        auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
        twilio_phone = getattr(settings, 'TWILIO_PHONE_NUMBER', None)
        
        # Check if Twilio credentials are configured
        if not all([account_sid, auth_token, twilio_phone]):
            return False, "Twilio credentials not configured"
        
        # Initialize Twilio client
        client = Client(account_sid, auth_token)
        
        # Prepare the message
        message_body = f"Your Worksyde verification code is: {otp_code}. This code will expire in 10 minutes."
        
        # Send the SMS
        message = client.messages.create(
            body=message_body,
            from_=twilio_phone,
            to=phone_number
        )
        
        print(f"Twilio SMS sent successfully. SID: {message.sid}")
        return True, "SMS sent successfully"
        
    except Exception as e:
        error_msg = f"Failed to send SMS: {str(e)}"
        print(error_msg)
        return False, error_msg


def generate_token_and_set_cookie(response, user_id):
    payload = {
        "userId": str(user_id),
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.DEBUG is False,
        samesite="Strict",
        max_age=7 * 24 * 60 * 60,  # 7 days
    )
    return token


@api_view(["POST"])
def signup(request):
    data = request.data
    fullname = data.get("fullname")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not all([fullname, email, password, role]):
        return Response(
            {"success": False, "message": "All fields are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects(email=email).first():
        return Response(
            {"success": False, "message": "Account already exists.."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    hashed_password = make_password(password)

    user = User(
        name=fullname, email=email, password=hashed_password, role=role, isverified=True
    )
    user.save()

    response = Response(
        {"success": True, "message": "Account successfully created.."},
        status=status.HTTP_201_CREATED,
    )

    generate_token_and_set_cookie(response, user.id)

    return response


@api_view(["POST"])
def login(request):
    data = request.data
    email = data.get("email")
    password = data.get("password")

    if not all([email, password]):
        return Response(
            {"success": False, "message": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects(email=email).first()
    if not user or not check_password(password, user.password):
        return Response(
            {"success": False, "message": "Invalid Credentials"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.lastLogin = timezone.now()
    user.onlineStatus = "online"
    user.lastSeen = timezone.now()
    user.save()

    response = Response(
        {
            "success": True,
            "message": "Successfully Logged In",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "role": user.role,
                "isverified": user.isverified,
                "lastLogin": user.lastLogin,
                "onlineStatus": user.onlineStatus,
                "lastSeen": user.lastSeen,
            },
        },
        status=status.HTTP_200_OK,
    )

    generate_token_and_set_cookie(response, user.id)

    return response


@api_view(["POST"])
@verify_token
def logout(request):
    try:
        # Set user status to offline before logging out
        user = request.user
        user.onlineStatus = "offline"
        user.lastSeen = timezone.now()
        user.save()
    except Exception as e:
        # Continue with logout even if status update fails
        print(f"Error updating user status on logout: {e}")

    response = Response(
        {"success": True, "message": "Successfully Logged out.."},
        status=status.HTTP_200_OK,
    )

    response.delete_cookie("access_token")
    return response


@api_view(["GET"])
@verify_token
def verify_view(request):
    return Response({"success": True, "message": "Token is valid."}, status=200)


@api_view(["GET"])
@verify_token
def current_user(request):
    user = request.user
    user_profile = Requests.objects(userId=user).first()
    photograph = user_profile.photograph if user_profile else None
    
    data = {
        "success": True,
        "message": "User fetched..",
        "user": {
            "_id": str(user.id),
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "isverified": user.isverified,
            "lastLogin": user.lastLogin,
            "photograph": photograph,
            "onlineStatus": user.onlineStatus,
            "lastSeen": user.lastSeen,
        },
    }
    
    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET"])
@verify_token
def get_user_profile(request):
    """Get current user's profile with phone information"""
    try:
        user = request.user
        
        # Get user's profile from Requests model
        profile = Requests.objects(userId=user).first()
        
        profile_data = {
            "success": True,
            "phone": profile.phone if profile else None,
            "user": {
                "_id": str(user.id),
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "isverified": user.isverified,
            }
        }

        return Response(profile_data)

    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=500,
        )


@api_view(["PUT"])
@verify_token
def update_user(request):
    """Update user's basic information (name and email)"""
    try:
        user = request.user
        data = request.data
        
        name = data.get("name")
        email = data.get("email")
        
        # Validate required fields
        if not name or not email:
            return Response(
                {"success": False, "message": "Name and email are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Check if email is already taken by another user
        existing_user = User.objects(email=email).first()
        if existing_user and str(existing_user.id) != str(user.id):
            return Response(
                {"success": False, "message": "Email is already taken by another user"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Update user information
        user.name = name
        user.email = email
        user.save()
        
        return Response(
            {
                "success": True,
                "message": "User information updated successfully",
                "user": {
                    "_id": str(user.id),
                    "name": user.name,
                    "email": user.email,
                },
            },
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        print("Error updating user:", e)
        return Response(
            {"success": False, "message": "Failed to update user information"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@verify_token
def update_online_status(request):
    user = request.user
    online_status = request.data.get("status")
    
    if online_status not in ["online", "offline"]:
        return Response(
            {"success": False, "message": "Invalid status. Must be 'online' or 'offline'."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    try:
        user.onlineStatus = online_status
        user.lastSeen = timezone.now()
        user.save()
        
        return Response(
            {
                "success": True,
                "message": f"Status updated to {online_status}",
                "user": {
                    "_id": str(user.id),
                    "onlineStatus": user.onlineStatus,
                    "lastSeen": user.lastSeen,
                },
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {"success": False, "message": "Failed to update status"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@verify_token
def get_user_online_status(request, user_id):
    try:
        user = User.objects(id=user_id).first()
        if not user:
            return Response(
                {"success": False, "message": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        return Response(
            {
                "success": True,
                "user": {
                    "_id": str(user.id),
                    "name": user.name,
                    "onlineStatus": user.onlineStatus,
                    "lastSeen": user.lastSeen,
                },
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {"success": False, "message": "Failed to get user status"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@verify_token
def update_last_seen(request):
    """Update user's last seen timestamp to keep them online"""
    try:
        user = request.user
        user.lastSeen = timezone.now()
        user.save()
        
        return Response(
            {
                "success": True,
                "message": "Last seen updated",
                "user": {
                    "_id": str(user.id),
                    "lastSeen": user.lastSeen,
                },
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {"success": False, "message": "Failed to update last seen"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def get_inactive_users(request):
    """Get users who haven't been active for more than 10 minutes"""
    try:
        # Set users to offline if they haven't been active for 10 minutes
        inactive_threshold = timezone.now() - timezone.timedelta(minutes=10)
        
        # Find users who are online but haven't been seen recently
        inactive_users = User.objects.filter(
            onlineStatus="online",
            lastSeen__lt=inactive_threshold
        )
        
        # Set them to offline
        for user in inactive_users:
            user.onlineStatus = "offline"
            user.save()
        
        return Response(
            {
                "success": True,
                "message": f"Set {inactive_users.count()} users to offline",
                "inactive_count": inactive_users.count(),
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {"success": False, "message": "Failed to process inactive users"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def send_otp(request):
    email = request.data.get("email")
    if not email:
        return Response({"success": False, "message": "Email is required"}, status=400)

    try:
        if User.objects(email=email).first():
            return Response(
                {"success": False, "message": "Account already exists.."},
                status=400,
            )

        otp_code = str(random.randint(100000, 999999))

        # Optional: Delete existing OTPs for the email to avoid duplicates
        Otp.objects(email=email).delete()

        Otp(email=email, code=otp_code).save()
        send_otp_email(email, otp_code)

        return Response(
            {"success": True, "message": "OTP sent to your email.."},
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)}, status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["POST"])
def verify_otp(request):
    email = request.data.get("email")
    code = request.data.get("code")

    if not email or not code:
        return Response(
            {"success": False, "message": "Email and code are required"},
            status=400,
        )

    try:
        otp = Otp.objects(email=email, code=code).first()
        if not otp:
            return Response(
                {"success": False, "message": "Invalid or expired OTP"}, status=400
            )

        otp.delete()

        return Response(
            {"success": True, "message": "Email verified successfully"},
            status=200,
        )
    except Exception as e:
        return Response(
            {
                "success": False,
                "message": "OTP verification failed",
                "error": str(e),
            },
            status=500,
        )


@api_view(["POST"])
@verify_token
def send_verification_code(request):
    """Send OTP code to phone number for verification"""
    phone_number = request.data.get("phone_number")
    
    if not phone_number:
        return Response(
            {"success": False, "message": "Phone number is required"},
            status=400,
        )

    try:
        # Generate 6-digit OTP
        otp_code = str(random.randint(100000, 999999))
        
        # Delete existing OTPs for the phone number to avoid duplicates
        PhoneOtp.objects(phone_number=phone_number).delete()
        
        # Set expiration time (10 minutes from now)
        from datetime import timedelta
        expires_at = timezone.now() + timedelta(minutes=10)
        
        # Save new OTP with expiration
        phone_otp_obj = PhoneOtp(phone_number=phone_number, code=otp_code, expiresAt=expires_at)
        phone_otp_obj.save()
        print(f"Saved OTP: {phone_otp_obj.id}, expires at: {expires_at}")
        
        # Send OTP via SMS
        sms_success, sms_message = send_otp_sms(phone_number, otp_code)
        
        if sms_success:
            print(f"OTP sent successfully to {phone_number}: {otp_code}")
            return Response(
                {
                    "success": True, 
                    "message": "Verification code sent successfully via SMS"
                },
                status=201,
            )
        else:
            # If SMS fails, still save OTP and return success (for development)
            print(f"OTP for {phone_number}: {otp_code} (SMS failed: {sms_message})")
            return Response(
                {
                    "success": True, 
                    "message": "Verification code generated. Check console for OTP.",
                    "debug_info": sms_message
                },
                status=201,
            )
            
    except Exception as e:
        print(f"Error in send_verification_code: {str(e)}")
        return Response(
            {"success": False, "message": f"Failed to send verification code: {str(e)}"},
            status=500,
        )


@api_view(["POST"])
@verify_token
def verify_phone(request):
    """Verify phone number with OTP code"""
    phone_number = request.data.get("phone_number")
    otp_code = request.data.get("otp_code")
    
    if not phone_number or not otp_code:
        return Response(
            {"success": False, "message": "Phone number and OTP code are required"},
            status=400,
        )

    try:
        print(f"Verifying OTP for phone: {phone_number}, code: {otp_code}")
        # Find the OTP record
        phone_otp = PhoneOtp.objects(phone_number=phone_number, code=otp_code).first()
        print(f"Found OTP record: {phone_otp}")
        
        if not phone_otp:
            return Response(
                {"success": False, "message": "Invalid OTP code"},
                status=400,
            )
        
        # Check if OTP has expired (handle cases where expiresAt might not exist)
        current_time = timezone.now()
        
        if hasattr(phone_otp, 'expiresAt') and phone_otp.expiresAt:
            # Make expiresAt timezone-aware if it's naive
            expires_at = phone_otp.expiresAt
            if is_naive(expires_at):
                expires_at = make_aware(expires_at, get_default_timezone())
            
            if expires_at < current_time:
                # Delete expired OTP
                phone_otp.delete()
                return Response(
                    {"success": False, "message": "OTP code has expired. Please request a new one."},
                    status=400,
                )
        else:
            # For backward compatibility, if expiresAt doesn't exist, consider it expired after 10 minutes
            from datetime import timedelta
            created_at = phone_otp.createdAt
            if is_naive(created_at):
                created_at = make_aware(created_at, get_default_timezone())
            
            if created_at + timedelta(minutes=10) < current_time:
                phone_otp.delete()
                return Response(
                    {"success": False, "message": "OTP code has expired. Please request a new one."},
                    status=400,
                )
        
        # Get user from request (from token)
        user = request.user
        
        if not user:
            return Response(
                {"success": False, "message": "User not found"},
                status=404,
            )
        
        # Update user's phone number
        user.phone = phone_number
        user.save()
        
        # Delete the used OTP
        phone_otp.delete()
        
        return Response(
            {
                "success": True, 
                "message": "Phone number verified successfully"
            },
            status=200,
        )
    except Exception as e:
        print(f"Error in verify_phone: {str(e)}")  # For debugging
        return Response(
            {
                "success": False, 
                "message": "Phone verification failed",
                "error": str(e),
            },
            status=500,
        )


@api_view(["POST"])
def save_survey_answers(request, user_id):
    answers = request.data.get("answers")

    if not user_id or not ObjectId.is_valid(user_id):
        return Response(
            {"message": "Invalid User ID"}, status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects(id=user_id).first()
    if not user:
        return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    user.freelanceSurveyAnswers = answers
    user.save()

    return Response(
        {"message": "Answers saved successfully"}, status=status.HTTP_200_OK
    )


@api_view(["POST"])
def add_category(request):
    name = request.data.get("name")
    if not name:
        return Response({"message": "Category name is required"}, status=400)

    try:
        category = Category(name=name)
        category.save()
        return Response({"_id": str(category.id), "name": category.name}, status=201)
    except Exception as e:
        return Response(
            {"message": "Error creating category", "error": str(e)}, status=500
        )


@api_view(["POST"])
def add_speciality(request):
    name = request.data.get("name")
    category_id = request.data.get("categoryId")

    if not all([name, category_id]):
        return Response(
            {"message": "Both name and categoryId are required"}, status=400
        )

    try:
        speciality = Speciality(name=name, categoryId=category_id)
        speciality.save()
        return Response(
            {"_id": str(speciality.id), "name": speciality.name}, status=201
        )
    except Exception as e:
        return Response(
            {"message": "Error creating speciality", "error": str(e)}, status=500
        )


@api_view(["GET"])
def get_category_with_speciality(request):
    try:
        categories = Category.objects.all()
        data = []

        for category in categories:
            specialities = Speciality.objects(categoryId=str(category.id))
            data.append(
                {
                    "category": {"_id": str(category.id), "name": category.name},
                    "specialities": [
                        {"_id": str(s.id), "name": s.name} for s in specialities
                    ],
                }
            )

        return Response(data, status=200)
    except Exception as e:
        return Response({"message": "Error fetching data", "error": str(e)}, status=500)


@api_view(["POST"])
def add_skill(request):
    name = request.data.get("name")
    if not name:
        return Response({"message": "Skill name is required."}, status=400)

    if Skill.objects(name=name).first():
        return Response({"message": "Skill already exists."}, status=400)

    try:
        skill = Skill(name=name)
        skill.save()
        return Response(
            {
                "message": "Skill added successfully",
                "skill": {"id": str(skill.id), "name": skill.name},
            },
            status=201,
        )
    except Exception as e:
        return Response({"message": "Error adding skill", "error": str(e)}, status=500)


@api_view(["GET"])
def get_skills(request):
    try:
        skills = Skill.objects.all()
        skill_list = [{"id": str(skill.id), "name": skill.name} for skill in skills]
        return Response(
            {
                "success": True,
                "message": "Skills fetched successfully",
                "skills": skill_list,
            },
            status=200,
        )
    except Exception as e:
        return Response(
            {"success": False, "message": "Error fetching skills", "error": str(e)},
            status=500,
        )


@api_view(["PUT"])
def update_skill(request, id):
    name = request.data.get("name")
    if not name:
        return Response({"message": "Skill name is required."}, status=400)

    try:
        skill = Skill.objects(id=id).first()
        if not skill:
            return Response({"message": "Skill not found."}, status=404)

        skill.name = name
        skill.save()
        return Response(
            {
                "message": "Skill updated successfully",
                "skill": {"id": str(skill.id), "name": skill.name},
            },
            status=200,
        )
    except Exception as e:
        return Response(
            {"message": "Error updating skill", "error": str(e)}, status=500
        )


@api_view(["DELETE"])
def delete_skill(request, id):
    try:
        skill = Skill.objects(id=id).first()
        if not skill:
            return Response(
                {"success": False, "message": "Skill not found"}, status=404
            )

        skill.delete()
        return Response(
            {"success": True, "message": "Skill deleted successfully"}, status=200
        )
    except Exception as e:
        return Response(
            {"success": False, "message": "Server error", "error": str(e)}, status=500
        )


@api_view(["POST"])
@parser_classes([MultiPartParser])
def upload_resume(request):
    try:
        user_id = request.data.get("userId")
        file = request.FILES.get("file")

        if not user_id or not ObjectId.is_valid(user_id):
            return Response({"message": "Valid User ID is required"}, status=400)

        if not file:
            return Response({"message": "No file uploaded"}, status=400)

        if file.content_type != "application/pdf":
            return Response({"message": "Only PDF files are allowed"}, status=400)

        if file.size > 5 * 1024 * 1024:
            return Response({"message": "File size exceeds 5MB"}, status=400)

        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)

        file_data = file.read()

        # Check if resume already exists
        resume = Resume.objects(userId=user).first()

        if resume:
            resume.fileName = file.name
            resume.contentType = file.content_type
            resume.data = file_data
            resume.save()
        else:
            resume = Resume(
                userId=user,
                fileName=file.name,
                contentType=file.content_type,
                data=file_data,
            ).save()

        resume_link = f"http://localhost:5000/api/auth/resumes/{resume.id}"

        # Update or create Requests entry
        request_obj = Requests.objects(userId=user).first()
        if request_obj:
            request_obj.resume = resume_link
            request_obj.save()
        else:
            Requests(userId=user, resume=resume_link, status="draft").save()

        return Response({"resumeLink": resume_link}, status=200)

    except Exception as e:
        print("Error during resume upload:", e)
        return Response(
            {
                "message": "Error uploading resume. Please try again later.",
                "error": str(e),
            },
            status=500,
        )


@api_view(["GET"])
def get_resume(request, id):
    try:
        resume = Resume.objects(id=id).first()
        if not resume:
            return HttpResponse("Resume not found", status=404)

        response = HttpResponse(resume.data, content_type=resume.contentType)
        response["Content-Disposition"] = f'inline; filename="{resume.fileName}"'
        return response

    except Exception as e:
        print("Error retrieving resume:", e)
        return HttpResponse("Error retrieving resume", status=500)


@api_view(["POST"])
def save_specialities(request):
    try:
        user_id = request.data.get("userId")
        category_id = request.data.get("categoryId")
        speciality_ids = request.data.get("specialities")  # list of speciality _ids

        if not all([user_id, category_id, speciality_ids]):
            return Response(
                {"message": "User ID, Category ID, and Specialities are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Fetch referenced documents
        user = User.objects(id=user_id).first()
        category = Category.objects(id=category_id).first()
        specialities = list(Speciality.objects(id__in=speciality_ids))

        if not user or not category or len(specialities) != len(speciality_ids):
            return Response(
                {"message": "Invalid user/category/speciality references."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request_obj = Requests.objects(userId=user).first()

        if request_obj:
            request_obj.categoryId = category
            request_obj.specialities = specialities
            request_obj.save()
        else:
            Requests.objects.create(
                userId=user,
                categoryId=category,
                specialities=specialities,
                status="draft",
            )

        return Response(
            {"message": "Specialities saved successfully"}, status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {
                "message": "Error saving specialities. Please try again later.",
                "error": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def save_title(request):
    try:
        user_id = request.data.get("userId")
        title = request.data.get("title")

        if not user_id or not title:
            return Response(
                {"message": "User ID and Title are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects(id=user_id).first()
        if not user:
            return Response(
                {"message": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        request_obj = Requests.objects(userId=user).first()

        if request_obj:
            request_obj.title = title
            request_obj.save()
        else:
            Requests.objects.create(userId=user, title=title, status="draft")

        return Response(
            {"message": "Title saved successfully"}, status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"message": "Error saving title. Please try again later.", "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def add_experience(request):
    data = request.data
    required_fields = [
        "userId",
        "title",
        "company",
        "city",
        "country",
        "startDate",
        "description",
    ]

    # Check if all required fields are provided
    if not all(data.get(field) for field in required_fields):
        return Response({"message": "Please provide all required fields"}, status=400)

    try:
        # Fetch the user object
        user = User.objects(id=data["userId"]).first()
        if not user:
            return Response({"message": "User not found"}, status=404)

        # Handle the "Present" case for endDate
        end_date = data.get("endDate", None)
        if end_date == "Present":
            end_date = timezone.now()  # Get the current date/time

        # Create the WorkExperience object
        experience = WorkExperience.objects.create(
            title=data["title"],
            company=data["company"],
            city=data["city"],
            country=data["country"],
            startDate=data["startDate"],  # Assuming startDate is a valid date string
            endDate=end_date,  # Save the actual date here
            description=data["description"],
        )

        # Fetch the associated request object
        req_obj = Requests.objects(userId=user).first()
        if not req_obj:
            return Response({"message": "Request not found"}, status=404)

        # Append the work experience to the request object
        req_obj.workExperience.append(experience)
        req_obj.save()

        return Response(
            {
                "message": "Work experience added successfully",
                "workExperienceId": str(experience.id),
            },
            status=200,
        )

    except Exception as e:
        import traceback

        error_details = traceback.format_exc()
        print(f"Error adding work experience: {error_details}")
        return Response({"message": "Internal Server Error"}, status=500)


from datetime import datetime


@api_view(["PUT"])
def update_experience(request, experience_id):
    data = request.data
    try:
        experience = WorkExperience.objects(id=experience_id).first()
        if not experience:
            return Response({"message": "Work experience not found"}, status=404)

        # Check and validate endDate field
        if "endDate" in data:
            end_date = data["endDate"]
            if end_date == "Present":
                # If "Present", set to the current date
                data["endDate"] = timezone.now()  # Get current date/time
            else:
                # If it's not "Present", make sure it's a valid date
                try:
                    # Try to convert endDate to a datetime object
                    data["endDate"] = datetime.strptime(
                        end_date, "%Y-%m-%d"
                    )  # Assuming the format is "YYYY-MM-DD"
                except ValueError:
                    return Response(
                        {"message": "Invalid date format for endDate"}, status=400
                    )

        # Update fields dynamically
        for field in [
            "title",
            "company",
            "city",
            "country",
            "startDate",
            "endDate",
            "description",
        ]:
            if field in data:
                setattr(experience, field, data[field])

        experience.save()

        return Response(
            {
                "message": "Work experience updated successfully",
                "experience": {
                    "_id": str(experience.id),
                    "title": experience.title,
                    "company": experience.company,
                    "city": experience.city,
                    "country": experience.country,
                    "startDate": experience.startDate,
                    "endDate": experience.endDate,
                    "description": experience.description,
                },
            },
            status=200,
        )

    except Exception as e:
        print("Error updating work experience:", e)
        return Response({"message": "Internal Server Error"}, status=500)


@api_view(["GET"])
def get_work_experiences(request, user_id):
    try:
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)

        req_obj = Requests.objects(userId=user).first()
        if not req_obj:
            return Response({"message": "Request not found"}, status=404)

        exp_data = [
            {
                "_id": str(exp.id),
                "title": exp.title,
                "company": exp.company,
                "city": exp.city,
                "country": exp.country,
                "startDate": exp.startDate,
                "endDate": exp.endDate,
                "description": exp.description,
            }
            for exp in req_obj.workExperience
        ]

        return Response({"workExperience": exp_data}, status=200)

    except Exception as e:
        import traceback

        error_details = traceback.format_exc()
        print(f"Error fetching work experience: {error_details}")
        return Response({"message": "Internal Server Error"}, status=500)


@api_view(["DELETE"])
def delete_experience(request, user_id, experience_id):
    try:
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)

        req_obj = Requests.objects(userId=user).first()
        if not req_obj:
            return Response({"message": "Request not found"}, status=404)

        experience = WorkExperience.objects(id=experience_id).first()
        if not experience:
            return Response({"message": "Experience not found"}, status=404)

        if experience in req_obj.workExperience:
            req_obj.workExperience.remove(experience)
            req_obj.save()
            experience.delete()
            return Response(
                {"message": "Work experience deleted successfully"}, status=200
            )
        else:
            return Response(
                {"message": "Experience not linked to this request"}, status=404
            )

    except Exception as e:
        print("Error deleting work experience:", e)
        return Response({"message": "Internal Server Error"}, status=500)


# GET WorkExperience by ID
@api_view(["GET"])
def get_experience_by_id(request, id):
    try:
        experience = WorkExperience.objects(id=id).first()
        if not experience:
            return Response({"message": "Work experience not found"}, status=404)

        data = {
            "id": str(experience.id),
            "title": experience.title,
            "company": experience.company,
            "city": experience.city,
            "country": experience.country,
            "startDate": experience.startDate,
            "endDate": experience.endDate,
            "description": experience.description,
        }
        return Response({"workExperience": data}, status=200)

    except Exception as e:
        return Response(
            {"message": "Error fetching work experience", "error": str(e)},
            status=500,
        )


@api_view(["POST"])
def add_language(request):
    user_id = request.data.get("userId")
    languages = request.data.get("languages")  # Expect list of {name, proficiency}

    if not user_id or not isinstance(languages, list) or not languages:
        return Response({"message": "Missing required fields"}, status=400)

    try:
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)

        req_obj = Requests.objects(userId=user).first()
        if not req_obj:
            req_obj = Requests(userId=user)

        # Validate language entries
        cleaned = []
        for lang in languages:
            name = lang.get("name")
            prof = lang.get("proficiency")
            if not name or not prof:
                return Response({"message": "Invalid language data"}, status=400)
            cleaned.append(Language(name=name, proficiency=prof))

        req_obj.languages = cleaned
        req_obj.save()

        return Response({"message": "Languages saved successfully"}, status=200)

    except Exception as e:
        print("Error saving languages:", e)
        return Response(
            {"message": "Internal server error", "error": str(e)}, status=500
        )


@api_view(["POST"])
def add_skills_to_requests(request):
    user_id = request.data.get("userId")
    skills = request.data.get("skills")  # Expecting a list of strings

    if not user_id or not isinstance(skills, list) or not skills:
        return Response({"message": "Missing required fields"}, status=400)

    try:
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)

        # Determine if skills are IDs or names
        if all(isinstance(s, str) and len(s) == 24 for s in skills):
            skill_docs = Skill.objects(id__in=skills)
        else:
            skill_docs = Skill.objects(name__in=skills)

        if not skill_docs:
            return Response({"message": "No matching skills found"}, status=404)

        req_obj = Requests.objects(userId=user).first()
        if not req_obj:
            req_obj = Requests(userId=user)

        req_obj.skills = list(skill_docs)
        req_obj.save()

        return Response({"message": "Skills saved successfully"}, status=200)

    except Exception as e:
        print("Error saving skills:", e)
        return Response(
            {"message": "Internal server error", "error": str(e)}, status=500
        )


@api_view(["POST"])
def add_biography(request):
    user_id = request.data.get("userId")
    bio = request.data.get("bio")

    if not user_id or not bio:
        return Response({"message": "Missing required fields"}, status=400)

    try:
        # Fetch User or related Request document
        req_obj = Requests.objects(userId=user_id).first()
        if not req_obj:
            return Response({"message": "Request not found"}, status=404)

        req_obj.bio = bio
        req_obj.save()

        return Response({"message": "Bio saved successfully"}, status=200)

    except Exception as e:
        print("Error saving bio:", e)
        return Response(
            {"message": "Internal server error", "error": str(e)}, status=500
        )


@api_view(["POST"])
def add_hourly_rate(request):
    user_id = request.data.get("userId")
    hourly_rate = request.data.get("hourlyRate")

    if not user_id or hourly_rate is None:
        return Response({"message": "Missing required fields"}, status=400)

    try:
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)

        req_obj = Requests.objects(userId=user).first()
        if not req_obj:
            req_obj = Requests(userId=user)

        req_obj.hourlyRate = float(hourly_rate)
        req_obj.save()

        return Response({"message": "Hourly rate saved successfully"}, status=200)
    except Exception as e:
        print("Error saving hourly rate:", e)
        return Response(
            {"message": "Internal server error", "error": str(e)}, status=500
        )


@api_view(["POST"])
def add_photo_location(request):
    try:
        user_id = request.data.get("userId")
        dob = request.data.get("dob")
        phone = request.data.get("phone")
        photo = request.data.get("photo")

        if not user_id:
            return Response({"message": "User ID is required"}, status=400)

        req_obj = Requests.objects(userId=user_id).first()
        if not req_obj:
            req_obj = Requests(userId=user_id)

        # Only update fields that are provided
        if dob is not None:
            req_obj.dob = dob
        if phone is not None:
            req_obj.phone = phone
        if photo is not None:
            req_obj.photograph = photo
            
        req_obj.save()

        return Response(
            {"message": "Phone and photo updated successfully"}, status=200
        )

    except Exception as e:
        print("Error saving phone/photo:", e)
        return Response({"message": "Server error", "error": str(e)}, status=500)


@api_view(["POST"])
@parser_classes([MultiPartParser])
def add_photograph(request):
    if "file" not in request.FILES:
        return Response({"message": "No file uploaded"}, status=400)

    file = request.FILES["file"]
    if not file.content_type.startswith("image/"):
        return Response({"message": "Only image files are allowed"}, status=400)

    # Get user ID from request data
    user_id = request.data.get("userId")
    if not user_id:
        return Response({"message": "User ID is required"}, status=400)

    try:
        # Upload the file
        filename = default_storage.save(f"uploads/{file.name}", ContentFile(file.read()))
        photo_url = f"{settings.MEDIA_URL}{filename}"
        full_photo_url = request.build_absolute_uri(photo_url)

        # Save the photo URL to the user's profile
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)

        req_obj = Requests.objects(userId=user).first()
        if not req_obj:
            req_obj = Requests(userId=user)

        req_obj.photograph = full_photo_url
        req_obj.save()

        return Response({"photoUrl": full_photo_url}, status=200)

    except Exception as e:
        print("Error uploading photograph:", e)
        return Response({"message": "Error uploading photograph", "error": str(e)}, status=500)


@api_view(["POST"])
def add_video_introduction(request):
    """
    Save video introduction URL to user's profile
    """
    try:
        data = request.data
        user_id = data.get("userId")
        video_url = data.get("videoUrl")

        if not user_id:
            return Response({"message": "User ID is required"}, status=400)

        # Handle deletion (empty string means delete)
        if video_url == "":
            print(f"Deleting video introduction for user: {user_id}")
            # Find user profile
            user = User.objects(id=user_id).first()
            if not user:
                return Response({"message": "User not found"}, status=404)

            req_obj = Requests.objects(userId=user).first()
            if req_obj:
                # Remove video introduction by setting to None
                req_obj.videoIntro = None
                req_obj.save()
                print(f"Video introduction removed for user: {user_id}")

            return Response({
                "message": "Video introduction removed successfully",
                "videoUrl": ""
            }, status=200)

        # Validate YouTube URL format for non-empty URLs
        if not video_url.startswith("https://www.youtube.com/") and not video_url.startswith("https://youtu.be/"):
            return Response({"message": "Please provide a valid YouTube URL"}, status=400)

        # Find or create user profile
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)

        req_obj = Requests.objects(userId=user).first()
        if not req_obj:
            req_obj = Requests(userId=user)

        # Save video introduction URL
        req_obj.videoIntro = video_url
        req_obj.save()
        print(f"Video introduction saved for user: {user_id}, URL: {video_url}")

        return Response({
            "message": "Video introduction saved successfully",
            "videoUrl": video_url
        }, status=200)

    except Exception as e:
        print("Error saving video introduction:", e)
        return Response({"message": "Error saving video introduction", "error": str(e)}, status=500)


@api_view(["GET"])
def get_profile_details(request, user_id):
    try:
        user_profile = Requests.objects(userId=user_id).first()
        if not user_profile:
            return Response({"message": "User profile not found"}, status=404)

        profile = {
            "userId": str(user_profile.userId.id),
            "title": user_profile.title,
            "resume": user_profile.resume,
            "bio": user_profile.bio,
            "dob": user_profile.dob,
            "phone": user_profile.phone,
            "photograph": user_profile.photograph,
            "videoIntro": user_profile.videoIntro,
            "hourlyRate": float(user_profile.hourlyRate or 0),
            "status": user_profile.status,
            "category": (
                {
                    "_id": str(user_profile.categoryId.id),
                    "name": user_profile.categoryId.name,
                }
                if user_profile.categoryId
                else None
            ),
            "skills": [{"_id": str(s.id), "name": s.name} for s in user_profile.skills],
            "specialities": [
                {"_id": str(sp.id), "name": sp.name} for sp in user_profile.specialities
            ],
            "languages": [
                {"name": lang.name, "proficiency": lang.proficiency}
                for lang in user_profile.languages
            ],
            "workExperience": [
                {
                    "_id": str(w.id),
                    "title": w.title,
                    "company": w.company,
                    "city": w.city,
                    "country": w.country,
                    "startDate": w.startDate,
                    "endDate": w.endDate,
                    "description": w.description,
                }
                for w in user_profile.workExperience
            ],
            "education": [
                {
                    "_id": str(e.id),
                    "school": e.school,
                    "degree": e.degree,
                    "fieldOfStudy": e.fieldOfStudy,
                    "startYear": (e.startYear if e.startYear else None),
                    "endYear": (e.endYear if e.endYear else None),
                    "description": e.description,
                }
                for e in user_profile.education
            ],
            "otherExperiences": [
                {
                    "_id": str(exp.id),
                    "subject": exp.subject,
                    "description": exp.description,
                    "createdAt": exp.createdAt,
                    "updatedAt": exp.updatedAt,
                }
                for exp in user_profile.otherExperiences
            ],
        }

        return Response(profile)

    except Exception as e:
        print("Error:", e)
        return Response({"message": "Server error", "error": str(e)}, status=500)


@api_view(["POST"])
def add_education(request):
    try:
        user_id = request.data.get("userId")
        if not user_id:
            return Response({"message": "User ID is required"}, status=400)

        education = Education(
            userId=user_id,
            school=request.data.get("school"),
            degree=request.data.get("degree"),
            fieldOfStudy=request.data.get("fieldOfStudy"),
            startYear=request.data.get("startYear"),
            endYear=request.data.get("endYear"),
            description=request.data.get("description"),
        )
        education.save()

        req_obj = Requests.objects(userId=user_id).first()
        if not req_obj:
            return Response({"message": "Request not found"}, status=404)

        req_obj.education.append(education)
        req_obj.save()

        return Response(
            {"message": "Education added", "educationId": str(education.id)}, status=200
        )
    except Exception as e:
        print(f"Error: {e}")  # or use logging for more advanced logging
        return Response(
            {"message": "Error adding education", "error": str(e)}, status=500
        )


@api_view(["PUT"])
def update_education(request, education_id):
    try:
        education = Education.objects.get(id=education_id)
        for field in [
            "school",
            "degree",
            "fieldOfStudy",
            "startYear",
            "endYear",
            "description",
        ]:
            if field in request.data:
                setattr(education, field, request.data[field])
        education.save()
        return Response(
            {"message": "Education updated", "educationId": str(education.id)}
        )
    except Education.DoesNotExist:
        return Response({"message": "Education not found"}, status=404)
    except Exception as e:
        return Response(
            {"message": "Error updating education", "error": str(e.message)}, status=500
        )


@api_view(["GET"])
def get_educations(request, user_id):
    try:
        req_obj = Requests.objects(userId=user_id).first()
        if not req_obj:
            return Response({"message": "Request not found"}, status=404)

        educations = [
            {
                "_id": str(e.id),
                "school": e.school,
                "degree": e.degree,
                "fieldOfStudy": e.fieldOfStudy,
                "startYear": e.startYear,
                "endYear": e.endYear,
                "description": e.description,
            }
            for e in req_obj.education
        ]
        return Response({"education": educations})
    except Exception as e:
        return Response(
            {"message": "Internal Server Error", "error": str(e.message)}, status=500
        )


@api_view(["DELETE"])
def delete_education(request, education_id, user_id):
    try:
        req_obj = Requests.objects(userId=user_id).first()
        if not req_obj:
            return Response({"message": "Request not found"}, status=404)

        req_obj.education = [e for e in req_obj.education if str(e.id) != education_id]
        req_obj.save()
        Education.objects.filter(id=education_id).delete()

        return Response({"message": "Education deleted successfully"})
    except Exception as e:
        return Response(
            {"message": "Internal Server Error", "error": str(e)}, status=500
        )


@api_view(["GET"])
def get_education_by_id(request, education_id):
    try:
        education = Education.objects(id=education_id).first()
        if not education:
            return Response({"message": "Education not found"}, status=404)

        education_data = {
            "_id": str(education.id),
            "school": education.school,
            "degree": education.degree,
            "fieldOfStudy": education.fieldOfStudy,
            "startYear": education.startYear,
            "endYear": education.endYear,
            "description": education.description,
        }

        return Response(education_data)

    except Exception as e:
        print("Error:", e)
        return Response({"message": "Server error", "error": str(e)}, status=500)


@api_view(["POST"])
def submit_for_review(request):
    user_id = request.data.get("userId")
    if not user_id:
        return Response(
            {"message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST
        )
    try:
        req_obj = Requests.objects.get(userId=user_id)
        req_obj.status = "under_review"
        req_obj.save()
        user = User.objects.get(id=user_id)
        send_under_review_email(user.email)
        return Response(
            {"message": "Your application is under review. Check your email."},
            status=status.HTTP_200_OK,
        )
    except DoesNotExist:
        return Response(
            {"message": "Request or User not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        print("Error submitting for review:", e)
        return Response(
            {"message": "Error processing request"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def check_request_status(request):
    user_id = request.data.get("userId")

    if not user_id:
        return Response(
            {"success": False, "message": "Missing userId in request"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user_request = Requests.objects.filter(userId=user_id).first()

        if not user_request:
            return Response(
                {"success": False, "message": "No request found for this user."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "success": True,
                "status": user_request.status,  # 'draft', 'under_review', or 'approved'
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        print("Error checking request status:", e)
        return Response(
            {"success": False, "message": "Internal server error"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def add_job_post_title(request):
    job_id = request.data.get("jobId")
    title = request.data.get("title")

    if not job_id or not title:
        return Response(
            {"message": "Job ID and Title are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        job_post = JobPosts.objects(id=job_id).first()

        if job_post:
            job_post.title = title
            job_post.save()  # Save the updated job post
        else:
            # If job post doesn't exist, create a new one
            JobPosts(id=job_id, title=title).save()

        return Response(
            {"message": "Title saved successfully"}, status=status.HTTP_200_OK
        )
    except Exception as e:
        print("Error saving title:", e)  # More detailed logging
        return Response(
            {"message": "Error saving title. Please try again later.", "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def add_job_scope(request):
    job_id = request.data.get("jobId")
    scope_of_work = request.data.get("scopeOfWork")
    duration = request.data.get("duration")
    experience_level = request.data.get("experienceLevel")
    contract_to_hire = request.data.get("contractToHire")

    if not all(
        [
            job_id,
            scope_of_work,
            duration,
            experience_level,
            contract_to_hire is not None,
        ]
    ):
        return Response(
            {"message": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Fetch the job post by job_id
        job_post = JobPosts.objects(id=job_id).first()

        if job_post:
            # Update the job scope details
            job_post.update(
                set__scopeOfWork=scope_of_work,
                set__duration=duration,
                set__experienceLevel=experience_level,
                set__isContractToHire=contract_to_hire,
            )
        else:
            # If job post doesn't exist, create a new one with the given details
            JobPosts(
                id=job_id,
                scopeOfWork=scope_of_work,
                duration=duration,
                experienceLevel=experience_level,
                isContractToHire=contract_to_hire,
            ).save()

        return Response(
            {"message": "Job scope details saved successfully"},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        print("Error saving job scope details:", e)
        return Response(
            {"message": "Error saving job scope details. Please try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def add_job_budget(request):
    job_id = request.data.get("jobId")
    hourly_rate_from = request.data.get("hourlyRateFrom")
    hourly_rate_to = request.data.get("hourlyRateTo")

    if not all([job_id, hourly_rate_from, hourly_rate_to]):
        return Response(
            {"message": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Fetch the job post by job_id
        job_post = JobPosts.objects(id=job_id).first()

        if job_post:
            # Update the job budget details
            job_post.update(
                set__hourlyRateFrom=hourly_rate_from,
                set__hourlyRateTo=hourly_rate_to,
            )
        else:
            # If job post doesn't exist, create a new one with the given details
            JobPosts(
                id=job_id,
                hourlyRateFrom=hourly_rate_from,
                hourlyRateTo=hourly_rate_to,
            ).save()

        return Response(
            {"message": "Job budget details saved successfully"},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        print("Error saving job budget:", e)
        return Response(
            {"message": "Error saving job budget. Please try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_job_post_attachment(request):
    job_id = request.data.get("jobId")
    description = request.data.get("description")
    file = request.FILES.get("file")

    if not job_id:
        return Response({"message": "Job ID is required"}, status=400)

    if not file:
        return Response({"message": "No file uploaded"}, status=400)

    if file.content_type != "application/pdf":
        return Response({"message": "Only PDF files are allowed"}, status=400)

    if file.size > 50 * 1024 * 1024:
        return Response({"message": "File size exceeds 50MB"}, status=400)

    try:
        # Get the job post document
        job_post = JobPosts.objects(id=job_id).first()
        if not job_post:
            return Response({"message": "Job post not found"}, status=404)

        # Check if attachment exists for this job
        attachment = JobAttachment.objects(jobId=job_post).first()

        if attachment:
            attachment.fileName = file.name
            attachment.contentType = file.content_type
            attachment.data = file.read()
            attachment.save()
        else:
            attachment = JobAttachment.objects.create(
                jobId=job_post,
                fileName=file.name,
                contentType=file.content_type,
                data=file.read(),
            )

        # Generate download URL
        jobpost_link = f"http://localhost:5000/api/jobposts/attachments/{attachment.id}"

        # Update job post with link and description
        job_post.attachments = jobpost_link
        if description:
            job_post.description = description
        job_post.save()

        return Response({"jobpostLink": jobpost_link}, status=200)

    except Exception as e:
        print("Error uploading job attachment:", traceback.format_exc())
        return Response(
            {
                "message": "Error uploading attachment. Please try again later.",
                "error": str(e),
            },
            status=500,
        )


@api_view(["GET"])
def get_job_attachment(request, id):
    try:
        attachment = JobAttachment.objects.get(id=id)

        response = HttpResponse(attachment.data, content_type=attachment.contentType)
        response["Content-Disposition"] = f"inline; filename={attachment.fileName}"
        return response

    except JobAttachment.DoesNotExist:
        return Response({"message": "Attachment not found"}, status=404)
    except Exception as e:
        return Response(
            {"message": "Error retrieving attachment", "error": str(e)}, status=500
        )


@api_view(["GET"])
def get_job_post_details(request, job_id):
    try:
        job_post = JobPosts.objects(id=job_id).first()

        if not job_post:
            return Response({"message": "Job Post not found"}, status=404)

        serializer = JobPostSerializer(job_post)
        return Response(serializer.data)

    except Exception as e:
        print("Error getting job post:", str(e))
        return Response({"message": "Server error", "error": str(e)}, status=500)


@api_view(["POST"])
def get_draft_job_post_id(request):
    try:
        user_id = request.data.get("userId")

        if not user_id:
            return Response(
                {"message": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            job_post = JobPosts.objects.get(userId=user_id, status="draft")
        except DoesNotExist:
            job_post = JobPosts(userId=user_id, status="draft", title="")
            job_post.save()

        return Response({"jobPostId": str(job_post.id)}, status=status.HTTP_200_OK)

    except Exception as e:
        print("Error fetching or creating draft job post:", e)
        return Response(
            {"message": "Internal server error", "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def add_job_post_skills(request):
    job_id = request.data.get("jobId")
    skills = request.data.get("skills")

    if not job_id or not skills:
        return Response(
            {"message": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Get skill documents
        skill_docs = Skill.objects(name__in=skills)

        # Get the job post
        job_post = JobPosts.objects(id=job_id).first()
        if not job_post:
            return Response({"message": "Job post not found"}, status=404)

        # Update skills
        job_post.skills = skill_docs
        job_post.save()

        return Response(
            {"jobPostId": str(job_post.id), "skills": [str(s.id) for s in skill_docs]},
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        print("Error saving skills:", e)
        return Response(
            {"message": "Internal server error", "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def send_verification_email(request):
    user_id = request.data.get("userId")
    job_id = request.data.get("jobId")

    try:
        user = User.objects(id=user_id).first()
        job_post = JobPosts.objects(id=job_id).first()

        if not user or not job_post:
            return Response({"message": "User or job post not found."}, status=404)

        verification_link = f"http://localhost:5000/api/auth/verify-email/jobpost/{job_id}?email={user.email}"

        subject = "Verify your email address, to get started on Worksyde"
        html_content = f"""
            <h3>Verify your email address to complete your registration</h3>
            <p>Hi {user.name}, <br/> 
            Welcome to Worksyde! <br/><br/> 
            Please verify your email address so you can get full access to qualified freelancers eager to tackle your project. <br/><br/>
            We're thrilled to have you on board!</p>
            <a href="{verification_link}" style="padding: 10px 20px; background-color: #007674; color: white; text-decoration: none;">Verify Email</a>
        """

        email = EmailMessage(
            subject=subject,
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        email.content_subtype = "html"
        email.send(fail_silently=False)

        return Response({"message": "Verification email sent."}, status=200)

    except Exception as e:
        print("Email sending error:", e)
        return Response({"message": "Server error.", "error": str(e)}, status=500)


@api_view(["GET"])
def verify_job_post_email(request, job_id):
    email = request.query_params.get("email")

    try:
        job_post = JobPosts.objects(id=job_id).first()
        if not job_post:
            return Response({"message": "Job post not found."}, status=404)

        user = User.objects(id=job_post.userId.id).first()
        if not user or user.email != email:
            return Response(
                {"message": "Unauthorized verification attempt."},
                status=status.HTTP_403_FORBIDDEN,
            )

        job_post.status = "verified"
        job_post.save()

        return Response(
            {"message": "Job post verified and approved successfully."},
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        print("Verification error:", e)
        return Response(
            {"message": "Server error.", "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def fetch_job_posts(request):
    try:
        # MongoEngine fetches references automatically, no need for select_related/prefetch_related
        job_posts = JobPosts.objects.all()

        serializer = JobPostSerializer(job_posts, many=True)
        return Response({"success": True, "data": serializer.data})
    except Exception as e:
        print("Error fetching job posts:", e)
        return Response(
            {"success": False, "message": "Error fetching job posts", "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def fetch_job_post_by_id(request):
    job_id = request.query_params.get("jobId")

    try:
        if not job_id:
            return Response(
                {"success": False, "message": "Job ID is required"}, status=400
            )

        job_id = job_id.strip().strip("/") 

        if not ObjectId.is_valid(job_id):
            return Response(
                {"success": False, "message": "Invalid job ID format"}, status=400
            )

        job_post = JobPosts.objects(id=job_id).first()
        if not job_post:
            return Response(
                {"success": False, "message": "Job post not found"}, status=404
            )

        serializer = JobPostSerializer(job_post)
        return Response({"success": True, "data": serializer.data})
    except Exception as e:
        print("Error fetching job post:", e)
        return Response(
            {"success": False, "message": "Error fetching job post", "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def create_job_proposal(request):
    try:
        data = request.data
        job_id = data.get("jobId")
        user_id = data.get("userId")
        project_scope = data.get("projectScope")
        bid_amount = data.get("bidAmount")
        service_fee = data.get("serviceFee")
        you_receive = data.get("youReceive")
        project_duration = data.get("projectDuration")
        cover_letter = data.get("coverLetter")
        milestones = data.get("milestones")

        attachment_link = None

        if "file" in request.FILES:
            file = request.FILES["file"]
            new_attachment = ProposalAttachment.objects.create(
                data=file.read(), contentType=file.content_type
            )
            attachment_link = f"http://localhost:5000/api/jobproposals/attachments/{new_attachment.id}"

        parsed_milestones = []
        if milestones and project_scope == "By Milestone":
            try:
                parsed_milestones = json.loads(milestones)
            except Exception as e:
                print("Invalid milestones JSON:", e)
                return Response(
                    {"success": False, "message": "Invalid milestones format"},
                    status=400,
                )

        # Check if proposal exists
        proposal = JobProposals.objects(jobId=job_id, userId=user_id).first()
        created = False

        if proposal:
            # Update
            proposal.update(
                projectScope=project_scope,
                bidAmount=bid_amount,
                serviceFee=service_fee,
                youReceive=you_receive,
                projectDuration=project_duration,
                coverLetter=cover_letter,
                attachment=attachment_link,
                milestones=parsed_milestones,
            )
            proposal.reload()
        else:
            # Create
            proposal = JobProposals.objects.create(
                jobId=job_id,
                userId=user_id,
                projectScope=project_scope,
                bidAmount=bid_amount,
                serviceFee=service_fee,
                youReceive=you_receive,
                projectDuration=project_duration,
                coverLetter=cover_letter,
                attachment=attachment_link,
                milestones=parsed_milestones,
            )
            created = True

        if created:
            JobPosts.objects(id=job_id).update(inc__applicants=1)

        return Response({
            "success": True,
            "data": {
                **JobProposalSerializer(proposal).data,
                "_id": str(proposal.id)
            }
        })

    except Exception as e:
        print("Error creating/updating job proposal:", e)
        return Response({"success": False, "message": str(e)}, status=500)


@api_view(["GET"])
def get_job_proposal_attachment(request, id):
    try:
        attachment = ProposalAttachment.objects.get(id=id)
        filename = getattr(attachment, 'fileName', None) or f"{attachment.id}.pdf"
        response = HttpResponse(attachment.data, content_type=attachment.contentType)
        response["Content-Disposition"] = f"inline; filename={filename}"
        return response
    except ProposalAttachment.DoesNotExist:
        return Response({"message": "ProposalAttachment not found"}, status=404)
    except Exception as e:
        print("Fetch error:", e)
        return Response({"message": "Error retrieving ProposalAttachment"}, status=500)


@api_view(["POST"])
def get_job_proposal_details_by_id(request):
    user_id = request.data.get("userId")
    job_proposal_id = request.data.get("jobProposalId")

    try:
        proposal = JobProposals.objects(id=job_proposal_id).first()

        if not proposal:
            return Response(
                {"success": False, "message": "Proposal not found."}, status=404
            )

        if str(proposal.userId.id) != str(user_id):
            return Response(
                {"success": False, "message": "Unauthorized access to this proposal."},
                status=403,
            )

        serializer = JobProposalSerializer(proposal)
        return Response({"success": True, "data": serializer.data})

    except Exception as e:
        print("Fetch error:", e)
        return Response(
            {
                "success": False,
                "message": "Error retrieving job proposal.",
                "error": str(e),
            },
            status=500,
        )


@api_view(["GET"])
def fetch_job_posts_for_client(request, user_id):
    try:
        job_posts = JobPosts.objects(userId=user_id)
        serializer = JobPostSerializer(job_posts, many=True)
        return Response({"success": True, "data": serializer.data})
    except Exception as e:
        print("Error fetching job posts for client:", e)
        return Response({"success": False, "message": str(e)}, status=500)


@api_view(["GET"])
def fetch_proposals_for_job(request, job_id):
    try:
        proposals = JobProposals.objects(jobId=job_id)
        serializer = JobProposalSerializer(proposals, many=True)
        return Response({"success": True, "data": serializer.data})
    except Exception as e:
        print("Error fetching proposals for job:", e)
        return Response({"success": False, "message": str(e)}, status=500)


@api_view(["GET"])
def get_freelancer_summary(request, user_id):
    try:
        # Get user basic info
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)
        # Get profile info
        req = Requests.objects(userId=user).first()
        if not req:
            return Response({"message": "Profile not found"}, status=404)
        # Get all proposals for this user
        proposals = JobProposals.objects(userId=user)
        total_earnings = sum([float(p.youReceive or 0) for p in proposals])
        # Job success rate: proposals with status 'completed' / all proposals
        completed_count = sum(1 for p in proposals if getattr(p, 'status', None) == 'completed')
        job_success = int((completed_count / proposals.count()) * 100) if proposals.count() > 0 else 0
        # Compose response
        data = {
            "name": user.name,
            "photograph": req.photograph,
            "title": req.title,
            "country": req.country,
            "hourlyRate": float(req.hourlyRate or 0),
            "skills": [{"_id": str(s.id), "name": s.name} for s in req.skills],
            "totalEarnings": total_earnings,
            "jobSuccess": job_success,
        }
        return Response(data)
    except Exception as e:
        print("Error in get_freelancer_summary:", e)
        return Response({"message": "Server error", "error": str(e)}, status=500)


@api_view(["GET"])
def get_freelancer_profile(request, user_id):
    try:
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)
        req = Requests.objects(userId=user).first()
        if not req:
            return Response({"message": "Profile not found"}, status=404)
        data = {
            "name": user.name,
            "photograph": req.photograph,
            "title": req.title,
        }
        return Response(data)
    except Exception as e:
        print("Error in get_freelancer_profile:", e)
        return Response({"message": "Server error", "error": str(e)}, status=500)


@api_view(["GET"])
def get_client_profile(request, user_id):
    try:
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)
        
        # Try to get any existing Requests object for this user (in case they were a freelancer before)
        user_profile = Requests.objects(userId=user).first()
        
        # Build profile data combining User and Requests data
        profile_data = {
            "userId": str(user.id),
            "name": user.name,
            "email": user.email,
            "phone": user_profile.phone if user_profile else user.phone,
            "companyName": user_profile.companyName if user_profile else None,
            "website": user_profile.website if user_profile else None,
            "industry": user_profile.industry if user_profile else None,
            "size": user_profile.size if user_profile else None,
            "tagline": user_profile.tagline if user_profile else None,
            "description": user_profile.description if user_profile else None,
        }
        
        return Response(profile_data)
    except Exception as e:
        print("Error in get_client_profile:", e)
        return Response({"message": "Server error", "error": str(e)}, status=500)


@api_view(["GET"])
def get_client_profile_details(request, user_id):
    """Get detailed client profile information including location data"""
    try:
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)
        
        # Try to get any existing Requests object for this user (in case they were a freelancer before)
        user_profile = Requests.objects(userId=user).first()
        
        # Get company information
        company_profile = Company.objects(userId=user).first()
        
        # Build profile data combining User, Requests, and Company data
        profile_data = {
            "userId": str(user.id),
            "name": user.name,
            "email": user.email,
            "phone": user_profile.phone if user_profile else user.phone,
            "companyName": company_profile.companyName if company_profile else None,
            "website": company_profile.website if company_profile else None,
            "industry": company_profile.industry if company_profile else None,
            "size": company_profile.size if company_profile else None,
            "tagline": company_profile.tagline if company_profile else None,
            "description": company_profile.description if company_profile else None,
            "logo": company_profile.logo if company_profile else None,
        }
        
        return Response(profile_data)
    except Exception as e:
        print("Error in get_client_profile_details:", e)
        return Response({"message": "Server error", "error": str(e)}, status=500)


# Payment Card API Endpoints
@api_view(["POST"])
@verify_token
def add_payment_card(request):
    """Add a new payment card for the authenticated user"""
    try:
        data = request.data
        user_id = request.user.id
        
        # Validate required fields
        required_fields = ['cardType', 'cardNumber', 'cardholderName', 'expiryMonth', 'expiryYear', 'cvv']
        for field in required_fields:
            if not data.get(field):
                return Response(
                    {"success": False, "message": f"{field} is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        
        # Validate card number format (basic validation)
        card_number = data.get('cardNumber', '').replace(' ', '')
        if not card_number.isdigit() or len(card_number) < 13 or len(card_number) > 19:
            return Response(
                {"success": False, "message": "Invalid card number format."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Validate expiry date
        try:
            expiry_month = int(data.get('expiryMonth'))
            expiry_year = int(data.get('expiryYear'))
            if expiry_month < 1 or expiry_month > 12:
                raise ValueError("Invalid month")
        except ValueError:
            return Response(
                {"success": False, "message": "Invalid expiry date."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Check if this card already exists for the user
        existing_card = PaymentCard.objects(
            userId=user_id,
            cardNumber=card_number,
            isActive=True
        ).first()
        
        if existing_card:
            return Response(
                {"success": False, "message": "This card is already registered."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # If this is the first card, make it default
        is_default = data.get('isDefault', False)
        if is_default:
            # Remove default from other cards
            PaymentCard.objects(userId=user_id, isDefault=True).update(isDefault=False)
        
        # Create the payment card
        payment_card = PaymentCard(
            userId=user_id,
            cardType=data.get('cardType'),
            cardNumber=card_number,
            cardholderName=data.get('cardholderName'),
            expiryMonth=data.get('expiryMonth'),
            expiryYear=data.get('expiryYear'),
            cvv=data.get('cvv'),
            isDefault=is_default,
            billingAddress=data.get('billingAddress'),
            billingCity=data.get('billingCity'),
            billingState=data.get('billingState'),
            billingPostalCode=data.get('billingPostalCode'),
            billingCountry=data.get('billingCountry'),
        )
        
        payment_card.save()
        
        return Response(
            {
                "success": True,
                "message": "Payment card added successfully.",
                "card": {
                    "id": str(payment_card.id),
                    "cardType": payment_card.cardType,
                    "lastFourDigits": payment_card.lastFourDigits,
                    "cardholderName": payment_card.cardholderName,
                    "expiryMonth": payment_card.expiryMonth,
                    "expiryYear": payment_card.expiryYear,
                    "isDefault": payment_card.isDefault,
                    "cardBrand": payment_card.cardBrand,
                }
            },
            status=status.HTTP_201_CREATED,
        )
        
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@verify_token
def get_payment_cards(request):
    """Get all payment cards for the authenticated user"""
    try:
        user_id = request.user.id
        
        cards = PaymentCard.objects(userId=user_id, isActive=True).order_by('-isDefault', '-createdAt')
        
        cards_data = []
        for card in cards:
            cards_data.append({
                "id": str(card.id),
                "cardType": card.cardType,
                "lastFourDigits": card.lastFourDigits,
                "cardholderName": card.cardholderName,
                "expiryMonth": card.expiryMonth,
                "expiryYear": card.expiryYear,
                "isDefault": card.isDefault,
                "cardBrand": card.cardBrand,
                "billingAddress": card.billingAddress,
                "billingCity": card.billingCity,
                "billingState": card.billingState,
                "billingPostalCode": card.billingPostalCode,
                "billingCountry": card.billingCountry,
                "createdAt": card.createdAt.isoformat() if card.createdAt else None,
            })
        
        return Response(
            {
                "success": True,
                "cards": cards_data
            },
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PUT"])
@verify_token
def update_payment_card(request, card_id):
    """Update a payment card"""
    try:
        user_id = request.user.id
        data = request.data
        
        # Get the card and verify ownership
        try:
            card = PaymentCard.objects.get(id=card_id, userId=user_id, isActive=True)
        except PaymentCard.DoesNotExist:
            return Response(
                {"success": False, "message": "Payment card not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Update fields if provided
        if 'cardholderName' in data:
            card.cardholderName = data['cardholderName']
        if 'expiryMonth' in data:
            card.expiryMonth = data['expiryMonth']
        if 'expiryYear' in data:
            card.expiryYear = data['expiryYear']
        if 'billingAddress' in data:
            card.billingAddress = data['billingAddress']
        if 'billingCity' in data:
            card.billingCity = data['billingCity']
        if 'billingState' in data:
            card.billingState = data['billingState']
        if 'billingPostalCode' in data:
            card.billingPostalCode = data['billingPostalCode']
        if 'billingCountry' in data:
            card.billingCountry = data['billingCountry']
        if 'isDefault' in data:
            is_default = data['isDefault']
            if is_default:
                # Remove default from other cards
                PaymentCard.objects(userId=user_id, isDefault=True).update(isDefault=False)
            card.isDefault = is_default
        
        card.save()
        
        return Response(
            {
                "success": True,
                "message": "Payment card updated successfully.",
                "card": {
                    "id": str(card.id),
                    "cardType": card.cardType,
                    "lastFourDigits": card.lastFourDigits,
                    "cardholderName": card.cardholderName,
                    "expiryMonth": card.expiryMonth,
                    "expiryYear": card.expiryYear,
                    "isDefault": card.isDefault,
                    "cardBrand": card.cardBrand,
                }
            },
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["DELETE"])
@verify_token
def delete_payment_card(request, card_id):
    """Delete a payment card (soft delete)"""
    try:
        user_id = request.user.id
        
        # Get the card and verify ownership
        try:
            card = PaymentCard.objects.get(id=card_id, userId=user_id, isActive=True)
        except PaymentCard.DoesNotExist:
            return Response(
                {"success": False, "message": "Payment card not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Soft delete the card
        card.isActive = False
        card.save()
        
        return Response(
            {
                "success": True,
                "message": "Payment card deleted successfully."
            },
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PUT"])
@verify_token
def set_default_payment_card(request, card_id):
    """Set a payment card as default"""
    try:
        user_id = request.user.id
        
        # Get the card and verify ownership
        try:
            card = PaymentCard.objects.get(id=card_id, userId=user_id, isActive=True)
        except PaymentCard.DoesNotExist:
            return Response(
                {"success": False, "message": "Payment card not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Remove default from all other cards
        PaymentCard.objects(userId=user_id, isDefault=True).update(isDefault=False)
        
        # Set this card as default
        card.isDefault = True
        card.save()
        
        return Response(
            {
                "success": True,
                "message": "Default payment card updated successfully."
            },
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@verify_token
def add_paypal_account(request):
    """Add a PayPal account for the user"""
    try:
        user_id = request.user.id
        paypal_email = request.data.get('paypalEmail')
        
        if not paypal_email:
            return Response(
                {"success": False, "message": "PayPal email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Check if PayPal account already exists for this user
        existing_account = PayPalAccount.objects.filter(
            userId=user_id, 
            paypalEmail=paypal_email, 
            isActive=True
        ).first()
        
        if existing_account:
            return Response(
                {"success": False, "message": "PayPal account with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Create new PayPal account
        paypal_account = PayPalAccount(
            userId=user_id,
            paypalEmail=paypal_email,
            isDefault=True  # Set as default if it's the first one
        )
        
        # If this is not the first account, don't set as default
        existing_accounts = PayPalAccount.objects.filter(userId=user_id, isActive=True)
        if existing_accounts.count() > 0:
            paypal_account.isDefault = False
        
        paypal_account.save()
        
        return Response(
            {
                "success": True,
                "message": "PayPal account added successfully.",
                "account": {
                    "id": str(paypal_account.id),
                    "paypalEmail": paypal_account.paypalEmail,
                    "isDefault": paypal_account.isDefault,
                    "createdAt": paypal_account.createdAt
                }
            },
            status=status.HTTP_201_CREATED,
        )
        
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@verify_token
def get_paypal_accounts(request):
    """Get all PayPal accounts for the user"""
    try:
        user_id = request.user.id
        
        paypal_accounts = PayPalAccount.objects.filter(
            userId=user_id, 
            isActive=True
        ).order_by('-createdAt')
        
        accounts_data = []
        for account in paypal_accounts:
            accounts_data.append({
                "id": str(account.id),
                "paypalEmail": account.paypalEmail,
                "isDefault": account.isDefault,
                "createdAt": account.createdAt,
                "updatedAt": account.updatedAt
            })
        
        return Response(
            {
                "success": True,
                "accounts": accounts_data
            },
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PUT"])
@verify_token
def update_paypal_account(request, account_id):
    """Update a PayPal account"""
    try:
        user_id = request.user.id
        paypal_email = request.data.get('paypalEmail')
        
        if not paypal_email:
            return Response(
                {"success": False, "message": "PayPal email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Get the account and verify ownership
        try:
            account = PayPalAccount.objects.get(id=account_id, userId=user_id, isActive=True)
        except PayPalAccount.DoesNotExist:
            return Response(
                {"success": False, "message": "PayPal account not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Check if email is already used by another account
        existing_account = PayPalAccount.objects.filter(
            userId=user_id, 
            paypalEmail=paypal_email, 
            isActive=True
        ).exclude(id=account_id).first()
        
        if existing_account:
            return Response(
                {"success": False, "message": "PayPal account with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Update the account
        account.paypalEmail = paypal_email
        account.save()
        
        return Response(
            {
                "success": True,
                "message": "PayPal account updated successfully.",
                "account": {
                    "id": str(account.id),
                    "paypalEmail": account.paypalEmail,
                    "isDefault": account.isDefault,
                    "updatedAt": account.updatedAt
                }
            },
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["DELETE"])
@verify_token
def delete_paypal_account(request, account_id):
    """Delete a PayPal account (soft delete)"""
    try:
        user_id = request.user.id
        
        # Get the account and verify ownership
        try:
            account = PayPalAccount.objects.get(id=account_id, userId=user_id, isActive=True)
        except PayPalAccount.DoesNotExist:
            return Response(
                {"success": False, "message": "PayPal account not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Soft delete the account
        account.isActive = False
        account.save()
        
        return Response(
            {
                "success": True,
                "message": "PayPal account deleted successfully."
            },
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PUT"])
@verify_token
def set_default_paypal_account(request, account_id):
    """Set a PayPal account as default"""
    try:
        user_id = request.user.id
        
        # Get the account and verify ownership
        try:
            account = PayPalAccount.objects.get(id=account_id, userId=user_id, isActive=True)
        except PayPalAccount.DoesNotExist:
            return Response(
                {"success": False, "message": "PayPal account not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Remove default from all other PayPal accounts
        PayPalAccount.objects(userId=user_id, isDefault=True).update(isDefault=False)
        
        # Set this account as default
        account.isDefault = True
        account.save()
        
        return Response(
            {
                "success": True,
                "message": "Default PayPal account updated successfully."
            },
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@verify_token
def initiate_paypal_payment(request):
    """Initiate a PayPal payment"""
    try:
        user_id = request.user.id
        amount = request.data.get('amount')
        currency = request.data.get('currency', 'USD')
        description = request.data.get('description', 'Worksyde Payment')
        
        if not amount:
            return Response(
                {"success": False, "message": "Amount is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # In a real implementation, you would:
        # 1. Create a PayPal order using PayPal SDK
        # 2. Store the order details in your database
        # 3. Return the PayPal order ID for frontend to complete payment
        
        # For now, we'll simulate the PayPal order creation
        paypal_order_id = f"PAYPAL_ORDER_{user_id}_{int(time.time())}"
        
        return Response(
            {
                "success": True,
                "message": "PayPal payment initiated successfully.",
                "paypalOrderId": paypal_order_id,
                "redirectUrl": f"https://www.paypal.com/checkoutnow?token={paypal_order_id}"
            },
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@verify_token
def complete_paypal_payment(request):
    """Complete a PayPal payment"""
    try:
        user_id = request.user.id
        paypal_order_id = request.data.get('paypalOrderId')
        payment_id = request.data.get('paymentId')
        
        if not paypal_order_id or not payment_id:
            return Response(
                {"success": False, "message": "PayPal order ID and payment ID are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # In a real implementation, you would:
        # 1. Verify the payment with PayPal
        # 2. Update your database with payment confirmation
        # 3. Send confirmation emails
        
        return Response(
            {
                "success": True,
                "message": "PayPal payment completed successfully.",
                "paymentId": payment_id,
                "orderId": paypal_order_id
            },
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@verify_token
def change_password(request):
    """
    Change user password with current password verification
    """
    try:
        data = request.data
        current_password = data.get("currentPassword")
        new_password = data.get("newPassword")
        confirm_password = data.get("confirmPassword")

        # Validate required fields
        if not all([current_password, new_password, confirm_password]):
            return Response(
                {
                    "success": False,
                    "message": "Current password, new password, and confirm password are required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate password confirmation
        if new_password != confirm_password:
            return Response(
                {
                    "success": False,
                    "message": "New password and confirm password do not match."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate password strength (minimum 8 characters)
        if len(new_password) < 8:
            return Response(
                {
                    "success": False,
                    "message": "Password must be at least 8 characters long."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get the authenticated user
        user = request.user

        # Verify current password
        if not check_password(current_password, user.password):
            return Response(
                {
                    "success": False,
                    "message": "Current password is incorrect."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if new password is same as current password
        if check_password(new_password, user.password):
            return Response(
                {
                    "success": False,
                    "message": "New password must be different from current password."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Hash the new password
        hashed_new_password = make_password(new_password)

        # Update user password
        user.password = hashed_new_password
        user.save()

        # Create response with success message
        response = Response(
            {
                "success": True,
                "message": "Password changed successfully. You will be logged out."
            },
            status=status.HTTP_200_OK,
        )

        # Clear the authentication cookie to force logout
        response.delete_cookie("access_token")

        return response

    except Exception as e:
        return Response(
            {
                "success": False,
                "message": f"An error occurred while changing password: {str(e)}"
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@verify_token
def get_profile_settings(request):
    """
    Get profile settings for the authenticated user
    """
    try:
        user = request.user
        
        # Get user's profile/request
        user_profile = Requests.objects(userId=user).first()
        
        if not user_profile:
            return Response(
                {
                    "success": False,
                    "message": "Profile not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        
        return Response(
            {
                "success": True,
                "profile_settings": {
                    "visibility": user_profile.visibility or "public",
                    "projectPreference": user_profile.projectPreference or "both",
                    "experienceLevel": user_profile.experienceLevel or "intermediate",
                    "aiPreference": user_profile.aiPreference or "depends"
                }
            },
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        return Response(
            {
                "success": False,
                "message": f"An error occurred while fetching profile settings: {str(e)}"
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PUT"])
@verify_token
def update_profile_settings(request):
    """
    Update profile settings for the authenticated user
    """
    try:
        user = request.user
        data = request.data
        
        # Get user's profile/request
        user_profile = Requests.objects(userId=user).first()
        
        if not user_profile:
            return Response(
                {
                    "success": False,
                    "message": "Profile not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Update fields if provided
        if "visibility" in data:
            user_profile.visibility = data["visibility"]
        if "projectPreference" in data:
            user_profile.projectPreference = data["projectPreference"]
        if "experienceLevel" in data:
            user_profile.experienceLevel = data["experienceLevel"]
        if "aiPreference" in data:
            user_profile.aiPreference = data["aiPreference"]
        
        user_profile.save()
        
        return Response(
            {
                "success": True,
                "message": "Profile settings updated successfully.",
                "profile_settings": {
                    "visibility": user_profile.visibility,
                    "projectPreference": user_profile.projectPreference,
                    "experienceLevel": user_profile.experienceLevel,
                    "aiPreference": user_profile.aiPreference
                }
            },
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        return Response(
            {
                "success": False,
                "message": f"An error occurred while updating profile settings: {str(e)}"
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def get_other_experiences(request, user_id):
    """
    Get all other experiences for a user
    """
    try:
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)

        other_experiences = OtherExperience.objects(userId=user).order_by("-createdAt")
        
        other_experiences_data = [
            {
                "_id": str(exp.id),
                "subject": exp.subject,
                "description": exp.description,
                "createdAt": exp.createdAt,
                "updatedAt": exp.updatedAt
            }
            for exp in other_experiences
        ]

        return Response({
            "otherExperiences": other_experiences_data
        }, status=200)

    except Exception as e:
        print("Error getting other experiences:", e)
        return Response({"message": "Error getting other experiences", "error": str(e)}, status=500)


@api_view(["POST"])
def add_other_experience(request):
    """
    Add a new other experience
    """
    try:
        data = request.data
        user_id = data.get("userId")
        subject = data.get("subject")
        description = data.get("description")

        if not user_id:
            return Response({"message": "User ID is required"}, status=400)

        if not subject or not description:
            return Response({"message": "Subject and description are required"}, status=400)

        # Find or create user profile
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)

        # Create new other experience
        other_experience = OtherExperience(
            userId=user,
            subject=subject,
            description=description
        )
        other_experience.save()

        # Add to user's profile
        req_obj = Requests.objects(userId=user).first()
        if not req_obj:
            req_obj = Requests(userId=user)

        if not req_obj.otherExperiences:
            req_obj.otherExperiences = []
        
        req_obj.otherExperiences.append(other_experience)
        req_obj.save()

        return Response({
            "message": "Other experience added successfully",
            "otherExperience": {
                "_id": str(other_experience.id),
                "subject": other_experience.subject,
                "description": other_experience.description,
                "createdAt": other_experience.createdAt,
                "updatedAt": other_experience.updatedAt
            }
        }, status=201)

    except Exception as e:
        print("Error adding other experience:", e)
        return Response({"message": "Error adding other experience", "error": str(e)}, status=500)


@api_view(["PUT"])
def update_other_experience(request, other_experience_id):
    """
    Update an existing other experience
    """
    try:
        data = request.data
        subject = data.get("subject")
        description = data.get("description")

        if not subject or not description:
            return Response({"message": "Subject and description are required"}, status=400)

        # Find the other experience
        other_experience = OtherExperience.objects(id=other_experience_id).first()
        if not other_experience:
            return Response({"message": "Other experience not found"}, status=404)

        # Update the other experience
        other_experience.subject = subject
        other_experience.description = description
        other_experience.updatedAt = timezone.now()
        other_experience.save()

        return Response({
            "message": "Other experience updated successfully",
            "otherExperience": {
                "_id": str(other_experience.id),
                "subject": other_experience.subject,
                "description": other_experience.description,
                "createdAt": other_experience.createdAt,
                "updatedAt": other_experience.updatedAt
            }
        }, status=200)

    except Exception as e:
        print("Error updating other experience:", e)
        return Response({"message": "Error updating other experience", "error": str(e)}, status=500)


@api_view(["DELETE"])
def delete_other_experience(request, other_experience_id, user_id):
    """
    Delete an other experience
    """
    try:
        # Find the other experience
        other_experience = OtherExperience.objects(id=other_experience_id).first()
        if not other_experience:
            return Response({"message": "Other experience not found"}, status=404)

        # Find user profile and remove from otherExperiences list
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)

        req_obj = Requests.objects(userId=user).first()
        if req_obj and req_obj.otherExperiences:
            req_obj.otherExperiences = [exp for exp in req_obj.otherExperiences if str(exp.id) != other_experience_id]
            req_obj.save()

        # Delete the other experience
        other_experience.delete()

        return Response({
            "message": "Other experience deleted successfully"
        }, status=200)

    except Exception as e:
        print("Error deleting other experience:", e)
        return Response({"message": "Error deleting other experience", "error": str(e)}, status=500)


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def add_company_details(request):
    """Add or update company details for a client"""
    try:
        user_id = request.data.get("userId")
        company_name = request.data.get("companyName")
        website = request.data.get("website")
        industry = request.data.get("industry")
        size = request.data.get("size")
        tagline = request.data.get("tagline")
        description = request.data.get("description")
        logo = request.FILES.get("logo")

        if not user_id:
            return Response({"message": "User ID is required"}, status=400)

        # Get or create Company object for this user
        company_obj = Company.objects(userId=user_id).first()
        if not company_obj:
            company_obj = Company(userId=user_id)

        # Update company fields
        if company_name is not None:
            company_obj.companyName = company_name
        if website is not None:
            company_obj.website = website
        if industry is not None:
            company_obj.industry = industry
        if size is not None:
            company_obj.size = size
        if tagline is not None:
            company_obj.tagline = tagline
        if description is not None:
            company_obj.description = description
        
        # Handle logo upload
        if logo:
            print(f"Logo upload detected: {logo.name}, size: {logo.size}")
            # Generate unique filename
            import uuid
            file_extension = logo.name.split('.')[-1]
            filename = f"company_logo_{user_id}_{uuid.uuid4().hex[:8]}.{file_extension}"
            
            # Save file to media directory
            file_path = f"company_logos/{filename}"
            print(f"Saving logo to: {file_path}")
            
            try:
                with default_storage.open(file_path, 'wb+') as destination:
                    for chunk in logo.chunks():
                        destination.write(chunk)
                
                # Update logo field with file path
                company_obj.logo = f"/media/{file_path}"
                print(f"Logo saved successfully: {company_obj.logo}")
            except Exception as e:
                print(f"Error saving logo: {e}")
                return Response({"message": "Error saving logo file", "error": str(e)}, status=500)
            
        company_obj.save()

        return Response(
            {"message": "Company details updated successfully"}, status=200
        )

    except Exception as e:
        print("Error saving company details:", e)
        return Response({"message": "Server error", "error": str(e)}, status=500)


@api_view(["GET"])
def get_company_details(request, user_id):
    """Get company details for a specific user"""
    try:
        company = Company.objects(userId=user_id).first()
        if not company:
            return Response({"message": "Company not found"}, status=404)
        
        company_data = {
            "companyName": company.companyName,
            "website": company.website,
            "industry": company.industry,
            "size": company.size,
            "tagline": company.tagline,
            "description": company.description,
            "logo": company.logo,
            "createdAt": company.createdAt,
            "updatedAt": company.updatedAt,
        }
        
        return Response(company_data)
    except Exception as e:
        print("Error in get_company_details:", e)
        return Response({"message": "Server error", "error": str(e)}, status=500)


@api_view(["GET"])
@verify_token
def get_client_profile_settings(request):
    """
    Get profile settings for the authenticated client user
    """
    try:
        user = request.user
        
        return Response(
            {
                "success": True,
                "profile_settings": {
                    "aiPreference": user.aiPreference or "depends"
                }
            },
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        return Response(
            {
                "success": False,
                "message": f"An error occurred while fetching profile settings: {str(e)}"
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PUT"])
@verify_token
def update_client_profile_settings(request):
    """
    Update profile settings for the authenticated client user
    """
    try:
        user = request.user
        data = request.data
        
        # Update fields if provided
        if "aiPreference" in data:
            user.aiPreference = data["aiPreference"]
        
        user.save()
        
        return Response(
            {
                "success": True,
                "message": "Profile settings updated successfully.",
                "profile_settings": {
                    "aiPreference": user.aiPreference
                }
            },
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        return Response(
            {
                "success": False,
                "message": f"An error occurred while updating profile settings: {str(e)}"
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
