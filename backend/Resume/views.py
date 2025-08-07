from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from mongoengine.errors import DoesNotExist, ValidationError
from Auth.models import ResumeBuilder, User
from Auth.decorators import verify_token
import json
from bson import ObjectId

# Helper: convert MongoEngine document to dict with stringified ObjectIds

def mongo_to_dict(obj):
    data = obj.to_mongo().to_dict()
    if '_id' in data:
        data['_id'] = str(data['_id'])
    if 'userId' in data:
        data['userId'] = str(data['userId'])
    # Recursively convert ObjectIds in embedded lists if needed
    return data

@csrf_exempt
@verify_token
def resume_list(request):
    """Handle GET (list resumes) and POST (create resume) for /api/ai-resumes/"""
    if request.method == "GET":
        try:
            user_id = str(request.user.id)
            user = User.objects.get(id=user_id)
            resumes = ResumeBuilder.objects(userId=user).order_by('-updatedAt')
            return JsonResponse([mongo_to_dict(r) for r in resumes], safe=False)
        except Exception as e:
            return JsonResponse({"message": "Failed to get resumes", "error": str(e)}, status=500)
    
    elif request.method == "POST":
        try:
            data = json.loads(request.body.decode())
            title = data.get('title')
            user_id = str(request.user.id)
            
            # Get the user object
            user = User.objects.get(id=user_id)
            
            # Create default resume data using the ResumeBuilder model structure
            resume = ResumeBuilder(
                userId=user,
                title=title,
                profileInfo={
                    "profilePreviewUrl": "",
                    "fullName": "",
                    "designation": "",
                    "summary": "",
                },
                contactInfo={
                    "email": "",
                    "phone": "",
                    "location": "",
                    "linkedin": "",
                    "github": "",
                    "website": "",
                },
                workExperience=[],
                education=[],
                skills=[],
                projects=[],
                certifications=[],
                languages=[],
                interests=[]
            )
            resume.save()
            return JsonResponse(mongo_to_dict(resume), status=201)
        except Exception as e:
            return JsonResponse({"message": "Failed to create resume", "error": str(e)}, status=500)
    
    else:
        return JsonResponse({"message": "Method not allowed"}, status=405)

@csrf_exempt
@verify_token
def resume_detail(request, resume_id):
    """Handle GET, PUT, DELETE for /api/ai-resumes/<resume_id>/"""
    try:
        user_id = str(request.user.id)
        user = User.objects.get(id=user_id)
        resume = ResumeBuilder.objects.get(id=resume_id, userId=user)
    except DoesNotExist:
        return JsonResponse({"message": "Resume not found.."}, status=404)
    except Exception as e:
        return JsonResponse({"message": "Failed to get resume", "error": str(e)}, status=500)
    
    if request.method == "GET":
        return JsonResponse(mongo_to_dict(resume), safe=False)
    
    elif request.method == "PUT":
        try:
            data = json.loads(request.body.decode())
            for k, v in data.items():
                setattr(resume, k, v)
            resume.save()
            return JsonResponse(mongo_to_dict(resume), safe=False)
        except Exception as e:
            return JsonResponse({"message": "Failed to update resume", "error": str(e)}, status=500)
    
    elif request.method == "DELETE":
        try:
            resume.delete()
            return JsonResponse({"message": "Resume deleted successfully"}, status=200)
        except Exception as e:
            return JsonResponse({"message": "Failed to delete resume", "error": str(e)}, status=500)
    
    else:
        return JsonResponse({"message": "Method not allowed"}, status=405)
