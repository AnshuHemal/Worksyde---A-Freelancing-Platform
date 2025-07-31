from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import F
from django.utils import timezone
from Auth.models import Requests
from .serializers import RequestSerializer
from .emails import send_freelancer_applicant_review_email


@api_view(['GET'])
def get_under_review_users_summary(request):
    try:
        requests = Requests.objects.filter(status="under_review").select_related("userId").only("userId", "title", "photograph")

        user_map = {}
        for req in requests:
            user = req.userId
            user_id_str = str(user.id)
            if user_id_str not in user_map:
                user_map[user_id_str] = {
                    "_id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "photograph": req.photograph,
                    "title": req.title or None
                }

        users_with_titles = list(user_map.values())
        return Response({"success": True, "users": users_with_titles}, status=status.HTTP_200_OK)
    except Exception as e:
        print("Error fetching under review users:", e)
        return Response({"success": False, "message": "Server error while fetching users"}, status=500)


@api_view(['POST'])
def get_under_review_requests(request):
    try:
        user_id = request.data.get("userId", "").replace("~", "")

        if not user_id:
            return Response({"success": False, "message": "User ID is required."}, status=400)

        request_obj = Requests.objects.select_related("userId", "categoryId").prefetch_related(
            "skills", "education", "workExperience", "specialities"
        ).filter(userId_id=user_id, status="under_review").first()

        if not request_obj:
            return Response({"success": False, "message": "No under-review request found for this user."}, status=404)

        serializer = RequestSerializer(request_obj)
        return Response({"success": True, "request": serializer.data}, status=200)
    except Exception as e:
        print("Error fetching request by userId:", e)
        return Response({"success": False, "message": "Server error while fetching request"}, status=500)


@api_view(['POST'])
def set_review_msg_and_send_user_email(request, request_id):
    status_val = request.data.get("status")
    review_feedback = request.data.get("reviewFeedback", "")

    if status_val not in ["approved", "rejected"]:
        return Response({"message": "Invalid status"}, status=400)

    try:
        req_obj = get_object_or_404(Requests.objects.select_related("userId"), id=request_id)

        req_obj.status = status_val
        req_obj.reviewedAt = timezone.now()
        req_obj.reviewFeedback = review_feedback if status_val == "rejected" else ""
        req_obj.save()

        review_msg = (
            "Your Application is approved."
            if status_val == "approved"
            else f"Your Application is rejected. Reason: {review_feedback}"
        )

        send_freelancer_applicant_review_email(req_obj.userId.email, review_msg)

        return Response({"message": "Request reviewed and email sent."}, status=200)
    except Exception as e:
        print("Error reviewing request:", e)
        return Response({"message": "Internal server error"}, status=500)
