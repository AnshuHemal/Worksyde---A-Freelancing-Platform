from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import F
from django.utils import timezone
from mongoengine.errors import DoesNotExist
from Auth.models import Requests, User, Skill, Speciality, Category
from Auth.decorators import require_admin, require_superadmin
from .serializers import RequestSerializer
from .emails import send_freelancer_applicant_review_email


@api_view(['GET'])
@require_admin
def get_under_review_users_summary(request):
    try:
        try:
            # Filter for only under_review status
            requests = Requests.objects.filter(status="under_review")
        except Exception as model_error:
            print(f"Error with Requests model: {model_error}")
            return Response({"success": False, "message": f"Model error: {str(model_error)}"}, status=500)

        users_with_details = []
        for req in requests:
            try:
                user = req.userId
                if not user:
                    print(f"Request {req.id} has no user")
                    continue
                    
                # Get profile image URL
                photo_url = None
                if user.profileImage:
                    photo_url = f"/api/auth/profile-image/{user.id}/"
                elif req.photograph:
                    photo_url = req.photograph
                
                request_data = {
                    "_id": str(req.id),
                    "userId": str(user.id),
                    "name": user.name,
                    "email": user.email,
                    "photograph": photo_url,
                    "title": req.title or None,
                    "status": req.status,
                    "submittedAt": req.submittedAt,
                    "reviewedAt": req.reviewedAt,
                    "reviewFeedback": req.reviewFeedback,
                    "state": req.state,
                    "country": req.country,
                    "currentlyReviewingBy": {
                        "id": str(req.currentlyReviewingBy.id),
                        "name": req.currentlyReviewingBy.name
                    } if req.currentlyReviewingBy else None,
                    "reviewStartedAt": req.reviewStartedAt,
                }
                # Add reviewer information if available (with fallback)
                try:
                    if hasattr(req, 'reviewedBy') and req.reviewedBy:
                        request_data["reviewedBy"] = {
                            "id": str(req.reviewedBy.id),
                            "name": req.reviewedBy.name,
                            "role": req.reviewedBy.role
                        }
                    else:
                        request_data["reviewedBy"] = None
                except Exception as reviewer_error:
                    print(f"Error getting reviewer info for request {req.id}: {reviewer_error}")
                    request_data["reviewedBy"] = None
                
                users_with_details.append(request_data)
                
            except Exception as req_error:
                print(f"Error processing request {req.id}: {req_error}")
                import traceback
                traceback.print_exc()
                continue

        return Response({"success": True, "users": users_with_details}, status=status.HTTP_200_OK)
    except Exception as e:
        print("Error fetching requests:", e)
        import traceback
        traceback.print_exc()
        return Response({"success": False, "message": f"Server error: {str(e)}"}, status=500)


@api_view(['GET'])
@require_admin
def test_requests_endpoint(request):
    """Simple test endpoint to check if Requests model works"""
    try:
        # Test basic query
        count = Requests.objects.count()
        
        # Test if we can get one request
        if count > 0:
            first_request = Requests.objects.first()
        
        return Response({
            "success": True, 
            "message": "Requests model is working",
            "total_requests": count
        }, status=200)
        
    except Exception as e:
        print(f"Test endpoint error: {e}")
        import traceback
        traceback.print_exc()
        return Response({
            "success": False, 
            "message": f"Test failed: {str(e)}"
        }, status=500)


@api_view(['POST'])
@require_admin
def get_under_review_requests(request):
    try:
        print("Starting to fetch request details...")
        user_id = request.data.get("userId", "").replace("~", "")
        print(f"User ID: {user_id}")

        if not user_id:
            return Response({"success": False, "message": "User ID is required."}, status=400)

        # Simple query without complex select_related
        request_obj = Requests.objects.filter(userId=user_id).first()
        
        if not request_obj:
            return Response({"success": False, "message": "No request found for this user."}, status=404)

        try:
            # Get the serialized data
            serializer = RequestSerializer(request_obj)
            serialized_data = serializer.data
            
            # Create a copy to avoid modifying the original
            request_data = dict(serialized_data)
            
            # Add proper photo URL if user has profile image
            if request_obj.userId and hasattr(request_obj.userId, 'profileImage') and request_obj.userId.profileImage:
                request_data['photograph'] = f"/api/auth/profile-image/{request_obj.userId.id}/"
            elif request_obj.photograph:
                request_data['photograph'] = request_obj.photograph
            else:
                request_data['photograph'] = None
                
            return Response({"success": True, "request": request_data}, status=200)
            
        except Exception as serializer_error:
            print(f"Serializer error: {serializer_error}")
            # Fallback to manual data construction
            # Fallback to manual data construction
            try:
                user = request_obj.userId
                photo_url = None
                if user and hasattr(user, 'profileImage') and user.profileImage:
                    photo_url = f"/api/auth/profile-image/{user.id}/"
                elif request_obj.photograph:
                    photo_url = request_obj.photograph
                
                # Properly populate skills
                skills_data = []
                if request_obj.skills:
                    for skill in request_obj.skills:
                        if skill:
                            skills_data.append({
                                'id': str(skill.id),
                                'name': skill.name
                            })
                
                # Properly populate education
                education_data = []
                if request_obj.education:
                    for edu in request_obj.education:
                        if edu:
                            education_data.append({
                                'id': str(edu.id),
                                'school': edu.school,
                                'degree': edu.degree,
                                'fieldOfStudy': edu.fieldOfStudy,
                                'startYear': edu.startYear,
                                'endYear': edu.endYear,
                                'description': edu.description
                            })
                
                # Properly populate work experience
                work_experience_data = []
                if request_obj.workExperience:
                    for exp in request_obj.workExperience:
                        if exp:
                            work_experience_data.append({
                                'id': str(exp.id),
                                'title': exp.title,
                                'company': exp.company,
                                'description': exp.description,
                                'startDate': exp.startDate,
                                'endDate': exp.endDate,
                                'city': exp.city,
                                'country': exp.country
                            })
                
                # Properly populate specialities
                specialities_data = []
                if request_obj.specialities:
                    for spec in request_obj.specialities:
                        if spec:
                            specialities_data.append({
                                'id': str(spec.id),
                                'name': spec.name
                            })
                
                # Properly populate category
                category_data = None
                if request_obj.categoryId:
                    category_data = {
                        'id': str(request_obj.categoryId.id),
                        'name': request_obj.categoryId.name
                    }
                
                # Properly populate languages
                languages_data = []
                if request_obj.languages:
                    for lang in request_obj.languages:
                        if lang:
                            languages_data.append({
                                'id': str(getattr(lang, 'id', '')),
                                'name': lang.name,
                                'proficiency': lang.proficiency
                            })
                
                manual_data = {
                    'id': str(request_obj.id),
                    '_id': str(request_obj.id),  # Add _id for compatibility
                    'userId': {
                        'id': str(user.id),
                        'name': user.name,
                        'email': user.email,
                        'role': user.role
                    } if user else None,
                    'title': request_obj.title,
                    'photograph': photo_url,
                    'status': request_obj.status,
                    'reviewedAt': request_obj.reviewedAt,
                    'reviewFeedback': request_obj.reviewFeedback,
                    'skills': skills_data,
                    'education': education_data,
                    'workExperience': work_experience_data,
                    'categoryId': category_data,
                    'specialities': specialities_data,
                    'dob': request_obj.dob,
                    'streetAddress': request_obj.streetAddress,
                    'city': request_obj.city,
                    'state': request_obj.state,
                    'postalCode': request_obj.postalCode,
                    'country': request_obj.country,
                    'phone': request_obj.phone,
                    'bio': request_obj.bio,
                    'hourlyRate': request_obj.hourlyRate,
                    'languages': languages_data,
                    'resume': request_obj.resume
                }
                
                return Response({"success": True, "request": manual_data}, status=200)
            except Exception as fallback_error:
                print(f"Fallback error: {fallback_error}")
                return Response({"success": False, "message": "Error processing request data"}, status=500)
    except Exception as e:
        print("Error fetching request by userId:", e)
        import traceback
        traceback.print_exc()
        return Response({"success": False, "message": f"Server error: {str(e)}"}, status=500)


@api_view(['POST'])
@require_admin
def start_reviewing_request(request, request_id):
    """Start reviewing a request - mark it as being reviewed by current admin"""
    try:
        try:
            req_obj = Requests.objects.get(id=request_id)
        except Requests.DoesNotExist:
            return Response({"success": False, "message": "Request not found"}, status=404)
        
        # Check if someone else is already reviewing
        if req_obj.currentlyReviewingBy and str(req_obj.currentlyReviewingBy.id) != str(request.user.id):
            reviewer_name = req_obj.currentlyReviewingBy.name if req_obj.currentlyReviewingBy.name else "Unknown"
            return Response({
                "success": False, 
                "message": f"This request is currently being reviewed by {reviewer_name}"
            }, status=409)
        
        # Mark as being reviewed by current admin
        req_obj.currentlyReviewingBy = request.user
        req_obj.reviewStartedAt = timezone.now()
        req_obj.save()
        
        reviewer_name = request.user.name if request.user.name else "Unknown"
        return Response({
            "success": True,
            "message": "Review started successfully",
            "reviewer": {
                "id": str(request.user.id),
                "name": reviewer_name
            }
        }, status=200)
        
    except Exception as e:
        print("Error starting review:", e)
        import traceback
        traceback.print_exc()
        return Response({"success": False, "message": f"Internal server error: {str(e)}"}, status=500)


@api_view(['POST'])
@require_admin
def stop_reviewing_request(request, request_id):
    """Stop reviewing a request - clear the current reviewer"""
    try:
        try:
            req_obj = Requests.objects.get(id=request_id)
        except Requests.DoesNotExist:
            return Response({"success": False, "message": "Request not found"}, status=404)
        
        # Only the current reviewer can stop reviewing
        if req_obj.currentlyReviewingBy and str(req_obj.currentlyReviewingBy.id) != str(request.user.id):
            return Response({
                "success": False, 
                "message": "You are not the current reviewer of this request"
            }, status=403)
        
        # Clear the current reviewer
        req_obj.currentlyReviewingBy = None
        req_obj.reviewStartedAt = None
        req_obj.save()
        
        return Response({
            "success": True,
            "message": "Review stopped successfully"
        }, status=200)
        
    except Exception as e:
        print("Error stopping review:", e)
        return Response({"success": False, "message": "Internal server error"}, status=500)


@api_view(['POST'])
@require_admin
def set_review_msg_and_send_user_email(request, request_id):
    status_val = request.data.get("status")
    review_feedback = request.data.get("reviewFeedback", "")

    if status_val not in ["approved", "rejected"]:
        return Response({"message": "Invalid status"}, status=400)

    try:
        try:
            req_obj = Requests.objects.get(id=request_id)
        except Requests.DoesNotExist:
            return Response({"success": False, "message": "Request not found"}, status=404)

        req_obj.status = status_val
        req_obj.reviewedAt = timezone.now()
        req_obj.reviewedBy = request.user  # Track which admin reviewed the request
        req_obj.reviewFeedback = review_feedback if status_val == "rejected" else ""
        # Clear the current reviewer since review is completed
        req_obj.currentlyReviewingBy = None
        req_obj.reviewStartedAt = None
        req_obj.save()

        review_msg = (
            "Your Application is approved."
            if status_val == "approved"
            else f"Your Application is rejected. Reason: {review_feedback}"
        )

        send_freelancer_applicant_review_email(req_obj.userId.email, review_msg)

        return Response({
            "success": True,
            "message": "Request reviewed and email sent.",
            "request": {
                "id": str(req_obj.id),
                "status": req_obj.status,
                "reviewedAt": req_obj.reviewedAt,
                "reviewedBy": {
                    "id": str(req_obj.reviewedBy.id),
                    "name": req_obj.reviewedBy.name,
                    "role": req_obj.reviewedBy.role
                } if req_obj.reviewedBy else None
            }
        }, status=200)
    except Exception as e:
        print("Error reviewing request:", e)
        return Response({"success": False, "message": "Internal server error"}, status=500)


# New endpoints for role-based access control

@api_view(['GET'])
@require_superadmin
def get_all_admins(request):
    """Get all admin and superadmin users - Superadmin only"""
    try:
        admin_users = User.objects.filter(role__in=['admin', 'superadmin']).only(
            'id', 'name', 'email', 'role', 'isverified', 'phoneVerified', 'createdAt', 'lastLogin'
        )
        
        admins_data = []
        for admin in admin_users:
            admins_data.append({
                '_id': str(admin.id),
                'name': admin.name,
                'email': admin.email,
                'role': admin.role,
                'isverified': admin.isverified,
                'phoneVerified': admin.phoneVerified,
                'createdAt': admin.createdAt,
                'lastLogin': admin.lastLogin,
                'isBanned': getattr(admin, 'isBanned', False),
                'banReason': getattr(admin, 'banReason', None)
            })
        
        return Response({
            "success": True, 
            "admins": admins_data,
            "total": len(admins_data)
        }, status=status.HTTP_200_OK)
    except Exception as e:
        print("Error fetching admin users:", e)
        return Response({"success": False, "message": "Server error while fetching admin users"}, status=500)


@api_view(['GET'])
@require_admin
def get_all_freelancers(request):
    """Get all freelancers with approved status in Requests table - Admin and Superadmin"""
    try:
        # Get all freelancers first - include isBanned, banReason, and onlineStatus fields
        all_freelancers = User.objects.filter(role='freelancer').only(
            'id', 'name', 'email', 'isverified', 'phoneVerified', 'createdAt', 'lastLogin', 'isBanned', 'banReason', 'onlineStatus'
        )
        
        freelancers_data = []
        for freelancer in all_freelancers:
            # Get the request object to check status and find reviewer information
            try:
                request_obj = Requests.objects.filter(userId=freelancer.id).first()
                
                # Only include freelancers whose request status is "approved" (verified)
                if not request_obj or request_obj.status != "approved":
                    continue
                
                reviewed_by = None
                if request_obj.reviewedBy:
                    reviewed_by = {
                        'id': str(request_obj.reviewedBy.id),
                        'name': request_obj.reviewedBy.name
                    }
            except Exception as req_error:
                print(f"Error getting request info for freelancer {freelancer.id}: {req_error}")
                continue
            
            is_banned = getattr(freelancer, 'isBanned', False)
            ban_reason = getattr(freelancer, 'banReason', None)
            online_status = getattr(freelancer, 'onlineStatus', 'offline')
            
            freelancers_data.append({
                '_id': str(freelancer.id),
                'name': freelancer.name,
                'email': freelancer.email,
                'isverified': freelancer.isverified,
                'phoneVerified': freelancer.phoneVerified,
                'createdAt': freelancer.createdAt,
                'lastLogin': freelancer.lastLogin,
                'isBanned': is_banned,
                'banReason': ban_reason,
                'onlineStatus': online_status,
                'reviewedBy': reviewed_by
            })
        
        return Response({
            "success": True, 
            "freelancers": freelancers_data,
            "total": len(freelancers_data)
        }, status=status.HTTP_200_OK)
    except Exception as e:
        print("Error fetching freelancers:", e)
        return Response({"success": False, "message": "Server error while fetching freelancers"}, status=500)


@api_view(['GET'])
@require_admin
def get_all_clients(request):
    """Get all client users - Admin and Superadmin"""
    try:
        clients = User.objects.filter(role='client').only(
            'id', 'name', 'email', 'isverified', 'phoneVerified', 'createdAt', 'lastLogin', 'isBanned', 'banReason', 'onlineStatus'
        )
        
        clients_data = []
        for client in clients:
                    is_banned = getattr(client, 'isBanned', False)
        ban_reason = getattr(client, 'banReason', None)
        online_status = getattr(client, 'onlineStatus', 'offline')
        
        clients_data.append({
            '_id': str(client.id),
            'name': client.name,
            'email': client.email,
            'isverified': client.isverified,
            'phoneVerified': client.phoneVerified,
            'createdAt': client.createdAt,
            'lastLogin': client.lastLogin,
            'isBanned': is_banned,
            'banReason': ban_reason,
            'onlineStatus': online_status
        })
        
        return Response({
            "success": True, 
            "clients": clients_data,
            "total": len(clients_data)
        }, status=status.HTTP_200_OK)
    except Exception as e:
        print("Error fetching clients:", e)
        return Response({"success": False, "message": "Server error while fetching clients"}, status=500)


@api_view(['GET'])
@require_superadmin
def get_all_skills(request):
    """Get all skills - Superadmin only"""
    try:
        skills = Skill.objects.all().only('id', 'name')
        
        skills_data = []
        for skill in skills:
            skills_data.append({
                '_id': str(skill.id),
                'name': skill.name
            })
        
        return Response({
            "success": True, 
            "skills": skills_data,
            "total": len(skills_data)
        }, status=status.HTTP_200_OK)
    except Exception as e:
        print("Error fetching skills:", e)
        return Response({"success": False, "message": "Server error while fetching skills"}, status=500)


@api_view(['POST'])
@require_superadmin
def create_skill(request):
    """Create a new skill - Superadmin only"""
    try:
        skill_name = request.data.get('name')
        if not skill_name:
            return Response({"success": False, "message": "Skill name is required"}, status=400)
        
        # Check if skill already exists
        existing_skill = Skill.objects.filter(name=skill_name).first()
        if existing_skill:
            return Response({"success": False, "message": "Skill already exists"}, status=400)
        
        new_skill = Skill(name=skill_name)
        new_skill.save()
        
        return Response({
            "success": True, 
            "message": "Skill created successfully",
            "skill": {
                '_id': str(new_skill.id),
                'name': new_skill.name
            }
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        print("Error creating skill:", e)
        return Response({"success": False, "message": "Server error while creating skill"}, status=500)


@api_view(['GET'])
@require_superadmin
def get_all_specialities(request):
    """Get all specialities - Superadmin only"""
    try:
        specialities = Speciality.objects.select_related('categoryId').all().only('id', 'name', 'categoryId')
        
        specialities_data = []
        for speciality in specialities:
            specialities_data.append({
                '_id': str(speciality.id),
                'name': speciality.name,
                'category': {
                    '_id': str(speciality.categoryId.id),
                    'name': speciality.categoryId.name
                } if speciality.categoryId else None
            })
        
        return Response({
            "success": True, 
            "specialities": specialities_data,
            "total": len(specialities_data)
        }, status=status.HTTP_200_OK)
    except Exception as e:
        print("Error fetching specialities:", e)
        return Response({"success": False, "message": "Server error while fetching specialities"}, status=500)


@api_view(['POST'])
@require_superadmin
def create_speciality(request):
    """Create a new speciality - Superadmin only"""
    try:
        speciality_name = request.data.get('name')
        category_id = request.data.get('categoryId')
        
        if not speciality_name:
            return Response({"success": False, "message": "Speciality name is required"}, status=400)
        
        if not category_id:
            return Response({"success": False, "message": "Category ID is required"}, status=400)
        
        # Check if speciality already exists
        existing_speciality = Speciality.objects.filter(name=speciality_name).first()
        if existing_speciality:
            return Response({"success": False, "message": "Speciality already exists"}, status=400)
        
        # Get the category
        category = Category.objects.filter(id=category_id).first()
        if not category:
            return Response({"success": False, "message": "Category not found"}, status=400)
        
        new_speciality = Speciality(name=speciality_name, categoryId=category)
        new_speciality.save()
        
        return Response({
            "success": True, 
            "message": "Speciality created successfully",
            "speciality": {
                '_id': str(new_speciality.id),
                'name': new_speciality.name,
                'category': {
                    '_id': str(category.id),
                    'name': category.name
                }
            }
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        print("Error creating speciality:", e)
        return Response({"success": False, "message": "Server error while creating speciality"}, status=500)


# Ban/Unban functionality

@api_view(['POST'])
@require_admin
def ban_user(request):
    """Ban a user account - Admin and Superadmin only"""
    try:
        user_id = request.data.get('userId')
        ban_reason = request.data.get('banReason', '')
        
        if not user_id:
            return Response({"success": False, "message": "User ID is required"}, status=400)
        
        # Get the user to ban
        user_to_ban = User.objects.filter(id=user_id).first()
        if not user_to_ban:
            return Response({"success": False, "message": "User not found"}, status=400)
        
        # Prevent banning admin/superadmin users (only superadmin can ban admins)
        if user_to_ban.role in ['admin', 'superadmin'] and request.user.role != 'superadmin':
            return Response({"success": False, "message": "Only superadmin can ban admin users"}, status=403)
        
        # Prevent self-banning
        if str(user_to_ban.id) == str(request.user.id):
            return Response({"success": False, "message": "You cannot ban yourself"}, status=400)
        
        # Ban the user
        user_to_ban.isBanned = True
        user_to_ban.banReason = ban_reason
        user_to_ban.bannedBy = request.user
        user_to_ban.bannedAt = timezone.now()
        user_to_ban.save()
        
        return Response({
            "success": True,
            "message": f"User {user_to_ban.name} has been banned successfully",
            "user": {
                '_id': str(user_to_ban.id),
                'name': user_to_ban.name,
                'email': user_to_ban.email,
                'isBanned': user_to_ban.isBanned,
                'banReason': user_to_ban.banReason
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("Error banning user:", e)
        return Response({"success": False, "message": "Server error while banning user"}, status=500)


@api_view(['POST'])
@require_admin
def unban_user(request):
    """Unban a user account - Admin and Superadmin only"""
    try:
        user_id = request.data.get('userId')
        
        if not user_id:
            return Response({"success": False, "message": "User ID is required"}, status=400)
        
        # Get the user to unban
        user_to_unban = User.objects.filter(id=user_id).first()
        if not user_to_unban:
            return Response({"success": False, "message": "User not found"}, status=400)
        
        # Check if user is actually banned
        if not user_to_unban.isBanned:
            return Response({"success": False, "message": "User is not banned"}, status=400)
        
        # Unban the user
        user_to_unban.isBanned = False
        user_to_unban.banReason = None
        user_to_unban.bannedBy = None
        user_to_unban.bannedAt = None
        user_to_unban.save()
        
        return Response({
            "success": True,
            "message": f"User {user_to_unban.name} has been unbanned successfully",
            "user": {
                '_id': str(user_to_unban.id),
                'name': user_to_unban.name,
                'email': user_to_unban.email,
                'isBanned': user_to_unban.isBanned
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("Error unbanning user:", e)
        return Response({"success": False, "message": "Server error while unbanning user"}, status=500)


@api_view(['GET'])
@require_admin
def check_user_ban_status(request):
    """Check if the current user is banned - for automatic logout"""
    try:
        user = request.user
        return Response({
            "success": True,
            "isBanned": getattr(user, 'isBanned', False),
            "banReason": getattr(user, 'banReason', None),
            "bannedBy": str(user.bannedBy.id) if user.bannedBy else None,
            "bannedAt": user.bannedAt.isoformat() if user.bannedAt else None
        }, status=200)
    except Exception as e:
        print("Error checking user ban status:", e)
        return Response({"success": False, "message": f"Server error: {str(e)}"}, status=500)



