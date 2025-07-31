from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from mongoengine.errors import DoesNotExist, ValidationError
from Auth.models import Resume
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
@require_http_methods(["POST"])
def create_resume(request):
    try:
        data = json.loads(request.body.decode())
        title = data.get('title')
        user_id = str(request.user.id)
        default_resume_data = {
            "profileInfo": {
                "profilePreviewUrl": "",
                "fullName": "",
                "designation": "",
                "summary": "",
            },
            "contactInfo": {
                "email": "",
                "phone": "",
                "location": "",
                "linkedin": "",
                "github": "",
                "website": "",
            },
            "workExperience": [
                {"company": "", "role": "", "startDate": "", "endDate": "", "description": ""}
            ],
            "education": [
                {"degree": "", "institution": "", "startDate": "", "endDate": ""}
            ],
            "skills": [
                {"name": "", "progress": 0}
            ],
            "projects": [
                {"title": "", "description": "", "github": "", "liveDemo": ""}
            ],
            "certifications": [
                {"title": "", "issuer": "", "year": ""}
            ],
            "languages": [
                {"name": "", "progress": 0}
            ],
            "interests": [""]
        }
        resume = Resume(
            userId=user_id,
            title=title,
            **default_resume_data
        )
        resume.save()
        return JsonResponse(mongo_to_dict(resume), status=201)
    except Exception as e:
        return JsonResponse({"message": "Failed to create resume", "error": str(e)}, status=500)

@csrf_exempt
@verify_token
@require_http_methods(["GET"])
def get_user_resumes(request):
    try:
        user_id = str(request.user.id)
        resumes = Resume.objects(userId=user_id).order_by('-updatedAt')
        return JsonResponse([mongo_to_dict(r) for r in resumes], safe=False)
    except Exception as e:
        return JsonResponse({"message": "Failed to get resumes", "error": str(e)}, status=500)

@csrf_exempt
@verify_token
@require_http_methods(["GET"])
def get_resume_by_id(request, resume_id):
    try:
        user_id = str(request.user.id)
        resume = Resume.objects.get(id=resume_id, userId=user_id)
        return JsonResponse(mongo_to_dict(resume), safe=False)
    except DoesNotExist:
        return JsonResponse({"message": "Resume not found.."}, status=404)
    except Exception as e:
        return JsonResponse({"message": "Failed to get resume", "error": str(e)}, status=500)

@csrf_exempt
@verify_token
@require_http_methods(["PUT"])
def update_resume(request, resume_id):
    try:
        user_id = str(request.user.id)
        resume = Resume.objects.get(id=resume_id, userId=user_id)
        data = json.loads(request.body.decode())
        for k, v in data.items():
            setattr(resume, k, v)
        resume.save()
        return JsonResponse(mongo_to_dict(resume), safe=False)
    except DoesNotExist:
        return JsonResponse({"message": "Resume not found or unauthorized.."}, status=404)
    except Exception as e:
        return JsonResponse({"message": "Failed to update resume", "error": str(e)}, status=500)

@csrf_exempt
@verify_token
@require_http_methods(["DELETE"])
def delete_resume(request, resume_id):
    try:
        user_id = str(request.user.id)
        resume = Resume.objects.get(id=resume_id, userId=user_id)
        # Optionally: handle file deletion if needed
        resume.delete()
        return JsonResponse({"message": "Resume deleted successfully.."})
    except DoesNotExist:
        return JsonResponse({"message": "Resume not found or unauthorized.."}, status=404)
    except Exception as e:
        return JsonResponse({"message": "Failed to delete resume", "error": str(e)}, status=500)
