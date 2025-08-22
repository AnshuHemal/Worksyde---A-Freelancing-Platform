import os
import pickle
import numpy as np
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status
from ml_models.budget_predictor import budget_predictor
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

# Load the budget prediction model
MODEL_PATH = os.path.join(settings.BASE_DIR, 'ml_models', 'budget_model.pkl')
try:
    with open(MODEL_PATH, 'rb') as f:
        budget_model = pickle.load(f)
except FileNotFoundError:
    budget_model = None
    print(f"Warning: Could not load budget model from {MODEL_PATH}"), JSONParser
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
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
    PaymentTransaction,
    Company,
    JobInvitation,
    DeclinedJobInvitation,
    JobOffer,
    AcceptedJobOffer,
    Notification,
    Milestone,
    WorksydeWallet,
    Transaction,
    ProjectSubmission,
    SubmissionComment,
)
from .serializers import (
    EducationSerializer,
    RequestProfileSerializer,
    JobPostSerializer,
    JobProposalSerializer,
    JobInvitationSerializer,
)
from Auth.decorators import verify_token
from Admin.emails import send_otp_email, send_under_review_email
from django.http import HttpResponse
import jwt
from datetime import datetime, timedelta
@api_view(["POST"])
@verify_token
def submit_project_submission(request):
    """Freelancer submits project for an accepted offer.
    Expects: acceptedOfferId, title, description, optional pdfFile (PDF only when provided)
    """
    try:
        user = request.user
        data = request.data
        accepted_offer_id = data.get('acceptedOfferId')
        title = (data.get('title') or '').strip()
        description = data.get('description') or ''
        pdf_link = None  # disallow external links for submissions

        if not accepted_offer_id or not title:
            return Response({"success": False, "message": "acceptedOfferId and title are required"}, status=400)

        try:
            accepted_offer = AcceptedJobOffer.objects.get(id=accepted_offer_id)
        except AcceptedJobOffer.DoesNotExist:
            return Response({"success": False, "message": "Accepted offer not found"}, status=404)

        # Only freelancer who owns the offer can submit
        if str(accepted_offer.freelancerId.id) != str(user.id):
            return Response({"success": False, "message": "Unauthorized"}, status=403)

        submission = ProjectSubmission(
            acceptedOfferId=accepted_offer,
            jobId=accepted_offer.jobId,
            clientId=accepted_offer.clientId,
            freelancerId=user,
            title=title,
            description=description,
            pdfLink=pdf_link
        )

        # Optional file (multipart)
        try:
            pdf_file = request.FILES.get('pdfFile') if hasattr(request, 'FILES') else None
            if pdf_file:
                content_type = getattr(pdf_file, 'content_type', '') or ''
                name_lower = getattr(pdf_file, 'name', '').lower()
                if content_type != 'application/pdf' and not name_lower.endswith('.pdf'):
                    return Response({"success": False, "message": "Only PDF files are allowed"}, status=400)
                submission.pdfFile = pdf_file.read()
                submission.pdfFileContentType = 'application/pdf'
            # If no file provided, proceed without a file (optional)
        except Exception:
            return Response({"success": False, "message": "Invalid file upload"}, status=400)

        submission.save()

        # Notify client
        try:
            n = Notification(
                recipientId=accepted_offer.clientId,
                senderId=user,
                jobId=accepted_offer.jobId,
                notificationType='system',
                title='Project submitted',
                message=f"{user.name} submitted work for '{accepted_offer.contractTitle}'.",
                additionalData={
                    'acceptedOfferId': str(accepted_offer.id),
                    'submissionId': str(submission.id),
                    'title': title,
                    'pdfLink': pdf_link
                }
            )
            n.save()
        except Exception as notif_err:
            print('Warning: submit notification failed:', notif_err)

        return Response({
            'success': True,
            'submissionId': str(submission.id)
        })
    except Exception as e:
        print('submit_project_submission error:', e)
        return Response({"success": False, "message": "Server error"}, status=500)


@api_view(["POST"])
@verify_token
def request_changes_submission(request, submission_id):
    """Client requests changes: add a comment, set status"""
    try:
        user = request.user
        comment_text = (request.data.get('comment') or '').strip()
        if not comment_text:
            return Response({"success": False, "message": "comment is required"}, status=400)
        try:
            submission = ProjectSubmission.objects.get(id=submission_id)
        except ProjectSubmission.DoesNotExist:
            return Response({"success": False, "message": "Submission not found"}, status=404)

        # Only the client of this submission can request changes
        if str(submission.clientId.id) != str(user.id):
            return Response({"success": False, "message": "Unauthorized"}, status=403)

        submission.status = 'Changes Requested'
        submission.comments.append(SubmissionComment(commenterId=user, text=comment_text))
        submission.save()

        # Notify freelancer
        try:
            n = Notification(
                recipientId=submission.freelancerId,
                senderId=user,
                jobId=submission.jobId,
                notificationType='system',
                title='Changes requested',
                message='Client requested changes on your submission.',
                additionalData={
                    'submissionId': str(submission.id),
                    'comment': comment_text
                }
            )
            n.save()
        except Exception as notif_err:
            print('Warning: changes notification failed:', notif_err)

        return Response({"success": True})
    except Exception as e:
        print('request_changes_submission error:', e)
        return Response({"success": False, "message": "Server error"}, status=500)


@api_view(["POST"])
@verify_token
def release_payment_submission(request, submission_id):
    """Client accepts and releases payment: move funds Worksyde -> Freelancer wallet"""
    try:
        user = request.user
        try:
            submission = ProjectSubmission.objects.get(id=submission_id)
        except ProjectSubmission.DoesNotExist:
            return Response({"success": False, "message": "Submission not found"}, status=404)

        # Only the client can release payment
        if str(submission.clientId.id) != str(user.id):
            return Response({"success": False, "message": "Unauthorized"}, status=403)

        # Determine payout from Worksyde wallet entry expected/estimated payout
        wallet = _get_or_create_worksyde_wallet()
        payout_amount = 0.0
        for entry in wallet.entries or []:
            matches = False
            try:
                matches = (str(getattr(entry, 'acceptedOfferId', None).id) == str(submission.acceptedOfferId.id))
            except Exception:
                matches = False
            if matches:
                # prefer estimatedFreelancerPayout, else expectedPayout
                payout_amount = float(getattr(entry, 'estimatedFreelancerPayout', None) or getattr(entry, 'expectedPayout', 0.0) or 0.0)
                # deduct from wallet entry amount and wallet balance
                try:
                    # reduce platform wallet balance by payout to freelancer
                    wallet.balance = float(wallet.balance or 0) - payout_amount
                    # When releasing, consider both payout and platform fee as leaving escrow
                    current_amount = float(getattr(entry, 'amount', 0.0) or 0.0)
                    platform_fee = float(getattr(entry, 'platformFee', 0.0) or 0.0)
                    amount_to_clear = payout_amount + platform_fee
                    # If amount_to_clear covers or exceeds escrow, set to 0; else subtract
                    if amount_to_clear >= current_amount or current_amount == 0:
                        entry.amount = 0.0
                    else:
                        entry.amount = max(0.0, current_amount - amount_to_clear)
                except Exception:
                    pass
                break

        # Credit freelancer wallet
        freelancer = submission.freelancerId
        try:
            freelancer.walletBalance = float(freelancer.walletBalance or 0) + payout_amount
        except Exception:
            pass
        wallet.save()
        freelancer.save()

        # Update submission status
        submission.status = 'Completed'
        submission.save()

        # Update accepted offer financials snapshot if needed
        try:
            offer = submission.acceptedOfferId
            # Increase milestonesPaid, decrease inEscrow
            current_paid = float(getattr(offer, 'milestonesPaid', 0.0) or 0.0)
            setattr(offer, 'milestonesPaid', current_paid + payout_amount)
            current_escrow = float(getattr(offer, 'inEscrow', 0.0) or 0.0)
            setattr(offer, 'inEscrow', max(0.0, current_escrow - payout_amount))
            # If nothing remains in escrow, set auto end timestamp (12 hours) and mark status
            try:
                if float(getattr(offer, 'inEscrow', 0.0) or 0.0) <= 0.0:
                    if hasattr(offer, 'status'):
                        offer.status = 'completed'
                    try:
                        offer.autoEndAt = timezone.now() + timedelta(hours=12)
                    except Exception:
                        pass
            except Exception:
                pass
            offer.save()
        except Exception as upd_err:
            print('Warning: could not update offer aggregates:', upd_err)

        # Notify freelancer
        try:
            n = Notification(
                recipientId=freelancer,
                senderId=user,
                jobId=submission.jobId,
                notificationType='system',
                title='Payment released',
                message=f'Client released payment: ₹{payout_amount:.2f}. The contract will auto-end in 12 hours unless ended earlier.',
                additionalData={'submissionId': str(submission.id), 'amount': payout_amount, 'autoEndInHours': 12}
            )
            n.save()
        except Exception as notif_err:
            print('Warning: payout notification failed:', notif_err)

        return Response({"success": True, "amount": payout_amount, "freelancerWalletBalance": freelancer.walletBalance, "worksydeWalletBalance": wallet.balance})
    except Exception as e:
        print('release_payment_submission error:', e)
        return Response({"success": False, "message": "Server error"}, status=500)

@api_view(['POST'])
@parser_classes([JSONParser])
def predict_budget(request):
    """
    Predict budget based on input features using the trained model.
    Expected input format:
    {
        'job_title': str,
        'job_description': str,
        'skills': list[str],
        'experience_level': str,
        'project_duration': str,
        'scope': str,
        'contract_type': str
    }
    """
    if not budget_predictor.model:
        return Response(
            {'success': False, 'message': 'Budget prediction model not available'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['job_title', 'job_description', 'experience_level', 'project_duration']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return Response(
                {'success': False, 'message': f'Missing required fields: {", ".join(missing_fields)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Prepare input features for prediction
        input_features = {
            'job_title': data.get('job_title', ''),
            'job_description': data.get('job_description', ''),
            'skills': data.get('skills', []),
            'experience_level': data.get('experience_level', 'Not specified'),
            'project_duration': data.get('project_duration', 'Not specified'),
            'scope': data.get('scope', 'Not specified'),
            'contract_type': data.get('contract_type', 'Fixed Term')
        }
        
        # Make prediction
        prediction = budget_predictor.predict_budget(input_features)
        
        # Handle different prediction result formats
        if isinstance(prediction, dict):
            # If prediction is a dictionary, try to extract a numeric value
            if 'prediction' in prediction:
                prediction = prediction['prediction']
            elif 'value' in prediction:
                prediction = prediction['value']
            else:
                # If no known keys, try to use the first numeric value
                for val in prediction.values():
                    if isinstance(val, (int, float, np.number)):
                        prediction = val
                        break
                else:
                    raise ValueError("Could not extract numeric prediction from dictionary")
        
        # Convert numpy types to Python native types for JSON serialization
        if isinstance(prediction, (np.floating, np.integer)):
            prediction = float(prediction)
            
        # Ensure prediction is within reasonable bounds (100 to 100,000)
        if not isinstance(prediction, (int, float)):
            raise ValueError(f"Prediction must be a number, got {type(prediction)}")
            
        prediction = max(100, min(prediction, 100000))
        
        return Response({
            'success': True,
            'predicted_budget': round(prediction, 2),
            'message': 'Budget prediction successful'
        })
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        traceback.print_exc()
        return Response(
            {'success': False, 'message': f'Error making prediction: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def get_submission_pdf(request, submission_id):
    """Serve the submission PDF either from stored binary or return external link if present."""
    try:
        user = request.user
        try:
            submission = ProjectSubmission.objects.get(id=submission_id)
        except ProjectSubmission.DoesNotExist:
            return Response({"success": False, "message": "Submission not found"}, status=404)

        # Only related client or freelancer can access
        if str(submission.clientId.id) != str(user.id) and str(submission.freelancerId.id) != str(user.id):
            return Response({"success": False, "message": "Unauthorized"}, status=403)

        if getattr(submission, 'pdfFile', None):
            content_type = submission.pdfFileContentType or 'application/pdf'
            response = HttpResponse(submission.pdfFile, content_type=content_type)
            filename = (submission.title or 'submission').replace(' ', '_') + '.pdf'
            response['Content-Disposition'] = f'inline; filename="{filename}"'
            return response

        if submission.pdfLink:
            return Response({"success": True, "pdfLink": submission.pdfLink})

        return Response({"success": False, "message": "No PDF available"}, status=404)
    except Exception as e:
        print('get_submission_pdf error:', e)
        return Response({"success": False, "message": "Server error"}, status=500)

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
from rest_framework.permissions import IsAuthenticated
import requests
import base64


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
def _get_or_create_worksyde_wallet():
    wallet = WorksydeWallet.objects().first()
    if not wallet:
        wallet = WorksydeWallet(balance=0.0).save()
    return wallet


@api_view(["POST"])
@verify_token
def transfer_client_to_worksyde(request):
    try:
        data = request.data
        amount = float(data.get("amount", 0))
        currency = data.get("currency", "INR")
        client_id = request.user.id
        freelancer_id = data.get("freelancerId")  # optional context

        if amount <= 0:
            return Response({"success": False, "message": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects(id=client_id).first()
        if not user:
            return Response({"success": False, "message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if user.walletBalance < amount:
            return Response({"success": False, "message": "Insufficient wallet balance"}, status=status.HTTP_400_BAD_REQUEST)

        wallet = _get_or_create_worksyde_wallet()

        # Perform updates
        old_client_balance = float(user.walletBalance)
        old_worksyde_balance = float(wallet.balance)
        user.walletBalance = old_client_balance - amount
        wallet.balance = old_worksyde_balance + amount
        user.save()
        wallet.save()

        # Record transaction
        txn = Transaction(
            fromType="client",
            toType="worksyde",
            clientId=user,
            amount=amount,
            currency=currency,
            type="Funding",
            status="Success",
        ).save()

        # Optional escrow metadata
        try:
            job_id = data.get("jobId")
            offer_id = data.get("offerId")
            if job_id or offer_id:
                from .models import WorksydeWallet as WorksydeWalletModel
                from .models import JobPosts, AcceptedJobOffer, ProjectSubmission, SubmissionComment
                entry = WorksydeWalletModel.WorksydeWalletEntry()
                if job_id:
                    try:
                        entry.jobId = JobPosts.objects.get(id=job_id)
                    except Exception:
                        entry.jobId = None
                entry.offerId = str(offer_id) if offer_id else None
                entry.amount = float(amount)
                # Compute expected payout to freelancer = subtotal; platform fees are not paid to freelancer
                try:
                    # The request from UI charges fixed fees over projectAmount
                    # For safety, try to recompute from JobOffer if available
                    subtotal = 0.0
                    if offer_id:
                        try:
                            jo = JobOffer.objects.get(id=offer_id)
                            # projectAmount could be string like "₹4,000"; sanitize
                            pa = str(jo.projectAmount).replace('₹','').replace(',','').strip()
                            subtotal = float(pa) if pa else 0.0
                        except Exception:
                            pass
                    # If not found, fallback to amount minus known fixed fees if provided
                    marketplace_fee = float(data.get('marketplaceFee', 50))
                    contract_fee = float(data.get('contractFee', 100))
                    if subtotal <= 0.0:
                        subtotal = max(0.0, float(amount) - marketplace_fee - contract_fee)
                    entry.expectedPayout = subtotal
                    entry.platformFee = float(amount) - subtotal
                    # Freelancer fee input; default 10%
                    freelancer_fee_percent = float(data.get('freelancerFeePercent', 10))
                    entry.freelancerFeePercent = freelancer_fee_percent
                    entry.freelancerFee = round(subtotal * (freelancer_fee_percent / 100.0), 2)
                    entry.estimatedFreelancerPayout = max(0.0, round(subtotal - entry.freelancerFee, 2))
                except Exception as fee_err:
                    print('Warning: failed to compute expected payout:', fee_err)
                wallet.entries.append(entry)
                wallet.save()
        except Exception as escrow_err:
            print("Warning: failed to append escrow entry:", escrow_err)

        return Response({
            "success": True,
            "message": "Funds transferred to Worksyde wallet",
            "clientWalletBalance": user.walletBalance,
            "worksydeWalletBalance": wallet.balance,
            "transactionId": str(txn.id),
        })
    except Exception as e:
        print("transfer_client_to_worksyde error:", e)
        # best-effort rollback if we already deducted/added
        try:
            user = User.objects(id=request.user.id).first()
            wallet = WorksydeWallet.objects().first()
            # naive rollback not guaranteed in concurrency
            # only roll back if available
            if user and wallet:
                pass
        except Exception:
            pass
        return Response({"success": False, "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@verify_token
def transfer_worksyde_to_freelancer(request):
    try:
        data = request.data
        amount = float(data.get("amount", 0))
        currency = data.get("currency", "INR")
        freelancer_id = data.get("freelancerId")

        if amount <= 0 or not freelancer_id:
            return Response({"success": False, "message": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)

        freelancer = User.objects(id=freelancer_id).first()
        if not freelancer:
            return Response({"success": False, "message": "Freelancer not found"}, status=status.HTTP_404_NOT_FOUND)

        wallet = _get_or_create_worksyde_wallet()
        if wallet.balance < amount:
            return Response({"success": False, "message": "Insufficient Worksyde wallet balance"}, status=status.HTTP_400_BAD_REQUEST)

        # Perform updates
        old_worksyde_balance = float(wallet.balance)
        old_freelancer_balance = float(freelancer.walletBalance or 0)
        wallet.balance = old_worksyde_balance - amount
        freelancer.walletBalance = old_freelancer_balance + amount
        wallet.save()
        freelancer.save()

        # Record transaction
        txn = Transaction(
            fromType="worksyde",
            toType="freelancer",
            freelancerId=freelancer,
            amount=amount,
            currency=currency,
            type="Payout",
            status="Success",
        ).save()

        return Response({
            "success": True,
            "message": "Payout sent to freelancer",
            "worksydeWalletBalance": wallet.balance,
            "freelancerWalletBalance": freelancer.walletBalance,
            "transactionId": str(txn.id),
        })
    except Exception as e:
        print("transfer_worksyde_to_freelancer error:", e)
        return Response({"success": False, "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@verify_token
def get_wallet_transactions(request):
    try:
        user_id = request.user.id
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"success": False, "message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Fetch transactions where user is involved (as client or freelancer)
        txns = Transaction.objects.filter(
            __raw__={
                "$or": [
                    {"clientId": user.id},
                    {"freelancerId": user.id},
                ]
            }
        ).order_by("-timestamp").limit(20)

        items = []
        for t in txns:
            items.append({
                "id": str(t.id),
                "from": t.fromType,
                "to": t.toType,
                "amount": float(t.amount),
                "currency": t.currency,
                "type": t.type,
                "status": t.status,
                "timestamp": t.timestamp.isoformat(),
            })

        wallet = _get_or_create_worksyde_wallet()
        return Response({
            "success": True,
            "transactions": items,
            "worksydeWalletBalance": float(wallet.balance),
        })
    except Exception as e:
        print("get_wallet_transactions error:", e)
        return Response({"success": False, "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



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
    
    # Check if user is banned
    if hasattr(user, 'isBanned') and user.isBanned:
        return Response({
            "success": False, 
            "message": "Your account has been banned",
            "banned": True,
            "banReason": getattr(user, 'banReason', 'No reason provided'),
            "bannedAt": getattr(user, 'bannedAt', None)
        }, status=status.HTTP_403_FORBIDDEN)

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
                "phoneVerified": getattr(user, 'phoneVerified', False),
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
    
    # Check if user is banned
    if hasattr(user, 'isBanned') and user.isBanned:
        return Response({
            "success": False,
            "message": "Your account has been banned",
            "banned": True,
            "banReason": getattr(user, 'banReason', 'No reason provided'),
            "bannedAt": getattr(user, 'bannedAt', None)
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Only use User model for photograph
    photograph = True if user.profileImage else None
    
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
            "phoneVerified": getattr(user, 'phoneVerified', False),
            "lastLogin": user.lastLogin,
            "photograph": photograph,
            "onlineStatus": user.onlineStatus,
            "lastSeen": user.lastSeen,
            "isBanned": getattr(user, 'isBanned', False),
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
        user.phoneVerified = True
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
def get_categories(request):
    """Get all categories for job post selection"""
    try:
        categories = Category.objects.all()
        category_list = [{"id": str(cat.id), "name": cat.name} for cat in categories]
        return Response(
            {
                "success": True,
                "message": "Categories fetched successfully",
                "categories": category_list,
            },
            status=200,
        )
    except Exception as e:
        return Response(
            {"success": False, "message": "Error fetching categories", "error": str(e)},
            status=500,
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
        # Read the file data
        image_data = file.read()
        image_content_type = file.content_type

        # Find the user
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)

        # Store image data directly in the database
        user.profileImage = image_data
        user.profileImageContentType = image_content_type
        user.save()

        print(f"Profile image saved to database successfully: {len(image_data)} bytes, type: {image_content_type}")

        # Return success response with a flag indicating image is stored in database
        return Response({
            "message": "Profile image uploaded successfully",
            "photoUrl": True  # Indicate image is stored in database
        }, status=200)

    except Exception as e:
        print("Error uploading photograph:", e)
        return Response({"message": "Error uploading photograph", "error": str(e)}, status=500)


@api_view(["GET"])
def get_profile_image(request, user_id):
    """Serve profile image from database"""
    try:
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)
        
        if not user.profileImage:
            return Response({"message": "Profile image not found"}, status=404)

        from django.http import HttpResponse
        response = HttpResponse(user.profileImage, content_type=user.profileImageContentType)
        response['Content-Disposition'] = 'inline'
        return response

    except Exception as e:
        print("Error serving profile image:", e)
        return Response({"message": "Server error", "error": str(e)}, status=500)


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

        # Get user for profile image
        user = User.objects(id=user_id).first()
        has_profile_image = user and user.profileImage is not None

        profile = {
            "userId": str(user_profile.userId.id),
            "title": user_profile.title,
            "resume": user_profile.resume,
            "bio": user_profile.bio,
            "dob": user_profile.dob,
            "phone": user_profile.phone,
            "photograph": True if has_profile_image else None,  # Only use User model for photograph
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
        # First, try to automatically detect the category using AI
        category = None
        
        # Simple keyword-based category detection as fallback
        title_lower = title.lower()
        
        # Define category keywords for fallback detection
        category_keywords = {
            "Web, Mobile & Software Dev": ["web", "mobile", "app", "software", "developer", "programming", "coding", "mern", "react", "node", "python", "java"],
            "Data Science & Analytics": ["data", "analytics", "science", "machine learning", "ai", "artificial intelligence", "statistics", "analysis"],
            "Accounting & Consulting": ["accounting", "consulting", "finance", "bookkeeping", "tax", "audit", "financial"],
            "IT & Networking": ["it", "networking", "system", "admin", "infrastructure", "server", "database", "cloud"],
            "Sales & Marketing": ["sales", "marketing", "social media", "advertising", "promotion", "brand", "campaign"],
            "Design & Creative": ["design", "creative", "graphic", "ui", "ux", "visual", "art", "illustration", "logo"],
            "Admin Support": ["admin", "support", "assistant", "virtual", "administrative", "office", "secretary"],
            "Engineering & Architecture": ["engineering", "architecture", "civil", "mechanical", "electrical", "structural"],
            "Customer Service": ["customer", "service", "support", "help", "assistance", "care"],
            "Legal": ["legal", "law", "attorney", "lawyer", "contract", "compliance"],
            "Translation": ["translation", "translate", "language", "localization", "interpretation"],
            "Writing": ["writing", "content", "copy", "blog", "article", "copywriting", "editorial"]
        }
        
        try:
            # Try AI-based detection first
            try:
                import sys
                import os
                # Get the absolute path to the tarz_chatbot directory
                current_dir = os.path.dirname(os.path.abspath(__file__))
                tarz_chatbot_path = os.path.join(current_dir, '..', 'tarz_chatbot')
                sys.path.append(tarz_chatbot_path)
                
                from tarz_chatbot.gemini import get_gemini_response
                print(f"Successfully imported Gemini from: {tarz_chatbot_path}")
                
                # Create a prompt for category detection
                prompt = f"""
                Based on this job title: "{title}"
                
                Please suggest the most appropriate category from this list:
                - Web, Mobile & Software Dev
                - Data Science & Analytics
                - Accounting & Consulting
                - IT & Networking
                - Sales & Marketing
                - Design & Creative
                - Admin Support
                - Engineering & Architecture
                - Customer Service
                - Legal
                - Translation
                - Writing
                
                Respond with ONLY the category name, nothing else.
                """
                
                ai_response = get_gemini_response(prompt)
                print(f"AI suggested category: {ai_response}")
                
                # Clean the response and find matching category
                if ai_response and not ai_response.startswith("[Gemini API"):
                    suggested_category = ai_response.strip()
                    print(f"AI suggested category: '{suggested_category}'")
                    
                    # Try exact match first
                    category = Category.objects(name__iexact=suggested_category).first()
                    
                    # If no exact match, try partial match
                    if not category:
                        category = Category.objects(name__icontains=suggested_category).first()
                    
                    # If still no match, try to find similar categories
                    if not category:
                        # Try to find categories that contain any word from the suggestion
                        words = suggested_category.split()
                        for word in words:
                            if len(word) > 3:  # Only consider words longer than 3 characters
                                potential_category = Category.objects(name__icontains=word).first()
                                if potential_category:
                                    category = potential_category
                                    print(f"Found similar category '{potential_category.name}' for word '{word}'")
                                    break
                    
                    if category:
                        print(f"AI found matching category: {category.name} (ID: {str(category.id)})")
                        print(f"Category object type: {type(category)}")
                        print(f"Category object: {category}")
                    else:
                        print(f"AI suggestion '{suggested_category}' didn't match any category")
                        
            except ImportError as import_error:
                print(f"Failed to import Gemini: {import_error}")
                print(f"Current working directory: {os.getcwd()}")
                print(f"Python path: {sys.path}")
                # Continue with keyword-based detection
            except Exception as gemini_error:
                print(f"Gemini API error: {gemini_error}")
                # Continue with keyword-based detection
        
        except Exception as ai_error:
            print(f"AI category detection failed: {ai_error}")
            import traceback
            traceback.print_exc()
            # Continue with keyword-based detection
        
        # Fallback to keyword-based detection if AI failed
        if not category:
            print("Using keyword-based category detection as fallback")
            for category_name, keywords in category_keywords.items():
                for keyword in keywords:
                    if keyword in title_lower:
                        category = Category.objects(name=category_name).first()
                        if category:
                            print(f"Keyword-based detection found category: {category.name} (ID: {str(category.id)}) for keyword: {keyword}")
                            break
                if category:
                    break
            
            if not category:
                print("No category detected using either AI or keyword-based methods")
                # Log available categories for debugging
                available_categories = [cat.name for cat in Category.objects.all()]
                print(f"Available categories: {available_categories}")
        
        # Debug: Print final category status
        if category:
            print(f"Final category selected: {category.name} (ID: {category.id})")
            print(f"Category object type: {type(category)}")
            print(f"Category object: {category}")
        else:
            print("No category selected - proceeding without category")
        
        job_post = JobPosts.objects(id=job_id).first()

        if job_post:
            job_post.title = title
            if category:
                print(f"Setting categoryId to: {category} (type: {type(category)})")
                job_post.categoryId = category  # Use the actual Category document
                print(f"Updated job post with category: {category.name}")
            job_post.save()  # Save the updated job post
            print(f"Updated existing job post: {job_post.id}")
        else:
            # If job post doesn't exist, create a new one
            try:
                job_post_data = {"id": job_id, "title": title}
                if category:
                    print(f"Adding category to job_post_data: {category} (type: {type(category)})")
                    job_post_data["categoryId"] = category  # Use the actual Category document
                    print(f"Creating job post with category: {category.name}")
                else:
                    print("Creating job post without category (AI detection failed)")
                
                print(f"Final job_post_data: {job_post_data}")
                JobPosts(**job_post_data).save()
                print(f"Successfully created new job post: {job_id}")
            except Exception as create_error:
                print(f"Error creating job post: {create_error}")
                import traceback
                traceback.print_exc()
                raise create_error

        return Response(
            {
                "message": "Title saved successfully",
                "categoryDetected": category is not None,
                "categoryId": str(category.id) if category else None,
                "categoryName": category.name if category else None
            }, 
            status=status.HTTP_200_OK
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
    ws_token = request.data.get("ws_token")
    duration = request.data.get("duration")
    experience_level = request.data.get("experienceLevel")
    contract_to_hire = request.data.get("contractToHire")

    if not all(
        [
            job_id,
            scope_of_work,
            ws_token is not None,
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
                set__ws_token=ws_token,
                set__duration=duration,
                set__experienceLevel=experience_level,
                set__isContractToHire=contract_to_hire,
                set__updatedAt=timezone.now(),
            )
        else:
            # If job post doesn't exist, create a new one with the given details
            JobPosts(
                id=job_id,
                scopeOfWork=scope_of_work,
                ws_token=ws_token,
                duration=duration,
                experienceLevel=experience_level,
                isContractToHire=contract_to_hire,
                createdAt=timezone.now(),
                updatedAt=timezone.now(),
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
    budget_type = request.data.get("budgetType")
    hourly_rate_from = request.data.get("hourlyRateFrom")
    hourly_rate_to = request.data.get("hourlyRateTo")
    
    print(f"Received budget data: job_id={job_id}, budget_type={budget_type}, hourly_rate_from={hourly_rate_from}, hourly_rate_to={hourly_rate_to}")

    if not all([job_id, budget_type]):
        return Response(
            {"message": "Job ID and budget type are required."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Fetch the job post by job_id
        job_post = JobPosts.objects(id=job_id).first()

        # Set rates based on budget type
        if budget_type == "fixed":
            # For fixed price, properly calculate fixed rate from hourly_rate_from
            if hourly_rate_from and str(hourly_rate_from).strip() != "":
                try:
                    fixed_rate = float(hourly_rate_from)
                    # Validate fixed rate is positive and reasonable
                    if fixed_rate <= 0:
                        return Response(
                            {"message": "Fixed price must be greater than 0."}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    if fixed_rate > 999999:  # Maximum reasonable fixed price
                        return Response(
                            {"message": "Fixed price is too high. Please enter a reasonable amount."}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    print(f"Fixed price mode: hourly_rate_from={hourly_rate_from}, calculated fixed_rate={fixed_rate}")
                except (ValueError, TypeError):
                    return Response(
                        {"message": "Invalid fixed price amount. Please enter a valid number."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                return Response(
                    {"message": "Fixed price amount is required."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # For hourly rate, set fixed rate to 0
            fixed_rate = 0
            # Ensure both hourly rates are provided
            if not hourly_rate_from or not hourly_rate_to:
                return Response(
                    {"message": "Both hourly rate from and to are required for hourly budget type."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate hourly rates are valid numbers
            try:
                hourly_from = float(hourly_rate_from)
                hourly_to = float(hourly_rate_to)
                
                if hourly_from <= 0 or hourly_to <= 0:
                    return Response(
                        {"message": "Hourly rates must be greater than 0."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if hourly_from > hourly_to:
                    return Response(
                        {"message": "Hourly rate 'from' must be less than or equal to hourly rate 'to'."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if hourly_from > 9999 or hourly_to > 9999:
                    return Response(
                        {"message": "Hourly rates are too high. Please enter reasonable amounts."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                print(f"Hourly rate mode: hourly_rate_from={hourly_from}, hourly_rate_to={hourly_to}")
            except (ValueError, TypeError):
                return Response(
                    {"message": "Invalid hourly rate amounts. Please enter valid numbers."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        if job_post:
            # Update the job budget details
            if budget_type == "fixed":
                # For fixed price, set hourly rates to 0
                job_post.update(
                    set__budgetType=budget_type,
                    set__hourlyRateFrom=0,
                    set__hourlyRateTo=0,
                    set__fixedRate=fixed_rate,
                    set__updatedAt=timezone.now(),
                )
            else:
                # For hourly rate, keep hourly rates as provided
                job_post.update(
                    set__budgetType=budget_type,
                    set__hourlyRateFrom=hourly_rate_from,
                    set__hourlyRateTo=hourly_rate_to,
                    set__fixedRate=fixed_rate,
                    set__updatedAt=timezone.now(),
                )
        else:
            # If job post doesn't exist, create a new one with the given details
            if budget_type == "fixed":
                # For fixed price, set hourly rates to 0
                JobPosts(
                    id=job_id,
                    budgetType=budget_type,
                    hourlyRateFrom=0,
                    hourlyRateTo=0,
                    fixedRate=fixed_rate,
                    createdAt=timezone.now(),
                    updatedAt=timezone.now(),
                ).save()
            else:
                # For hourly rate, keep hourly rates as provided
                JobPosts(
                    id=job_id,
                    budgetType=budget_type,
                    hourlyRateFrom=hourly_rate_from,
                    hourlyRateTo=hourly_rate_to,
                    fixedRate=fixed_rate,
                    createdAt=timezone.now(),
                    updatedAt=timezone.now(),
                ).save()

        # Prepare response message with saved values
        if budget_type == "fixed":
            response_message = f"Fixed price budget saved successfully: ₹{fixed_rate}"
        else:
            response_message = f"Hourly rate budget saved successfully: ₹{hourly_rate_from} - ₹{hourly_rate_to}"
        
        return Response(
            {"message": response_message},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        print("Error saving job budget:", e)
        import traceback
        traceback.print_exc()
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

    # File is optional, but if provided, validate it
    if file:
        if file.content_type != "application/pdf":
            return Response({"message": "Only PDF files are allowed"}, status=400)

        if file.size > 50 * 1024 * 1024:
            return Response({"message": "File size exceeds 50MB"}, status=400)

    try:
        # Get the job post document
        job_post = JobPosts.objects(id=job_id).first()
        if not job_post:
            return Response({"message": "Job post not found"}, status=404)

        # Update job post with description if provided
        if description:
            job_post.description = description
            
        # Ensure isContractToHire has a valid value before saving
        if not hasattr(job_post, 'isContractToHire') or not job_post.isContractToHire:
            job_post.isContractToHire = "No, not at this time"
        elif job_post.isContractToHire not in ["Yes, this is a contract-to-hire opportunity", "No, not at this time"]:
            job_post.isContractToHire = "No, not at this time"
        
        # Handle file upload if provided
        if file:
            # Check if attachment exists for this job
            attachment = JobAttachment.objects(jobId=job_post).first()

            if attachment:
                attachment.fileName = file.name
                attachment.contentType = file.content_type
                attachment.fileSize = file.size
                attachment.data = file.read()
                attachment.save()
            else:
                attachment = JobAttachment.objects.create(
                    jobId=job_post,
                    fileName=file.name,
                    contentType=file.content_type,
                    fileSize=file.size,
                    data=file.read(),
                )

            # Generate download URL
            jobpost_link = f"http://localhost:5000/api/auth/jobposts/attachments/{attachment.id}"

            # Update job post with attachment link
            job_post.attachments = jobpost_link
            job_post.save()

            attachment_response = {
                "jobpostLink": jobpost_link,
                "attachmentId": str(attachment.id),
                "fileName": attachment.fileName,
                "fileSize": attachment.fileSize,
                "contentType": attachment.contentType
            }
            
            return Response(attachment_response, status=200)
        else:
            # No file uploaded, just save description
            job_post.save()
            
            return Response({
                "message": "Job description saved successfully",
                "description": description
            }, status=200)

    except Exception as e:
        print("Error uploading job attachment:", traceback.format_exc())
        return Response(
            {
                "message": "Error uploading attachment. Please try again later.",
                "error": str(e),
            },
            status=500,
        )


@api_view(["POST"])
def generate_job_title(request):
    """Improve a job title using AI based on current title"""
    try:
        current_title = request.data.get("currentTitle")
        
        if not current_title or not current_title.strip():
            return Response({"message": "Current job title is required"}, status=400)
        
        if len(current_title.strip()) < 5:
            return Response({"message": "Please provide a longer job title (at least 5 characters)"}, status=400)
        
        if len(current_title.strip()) > 200:
            return Response({"message": "Job title is too long (maximum 200 characters)"}, status=400)
        
        # Try to use Gemini AI for title improvement
        try:
            from tarz_chatbot.gemini import get_gemini_response
            
            prompt = f"""
            Improve the following job title to make it more compelling, specific, and professional. 
            The improved title should attract better freelancers and be more descriptive.
            
            Current Job Title: {current_title}
            
            Requirements for the improved job title:
            1. Start with action words like "Need", "Hire", "Looking for", "Seeking"
            2. Be specific about the role/technology (e.g., "React Developer", "Content Writer", "UI/UX Designer")
            3. Include the purpose or context (e.g., "for Web App", "for Marketing", "for Mobile App")
            4. Keep it under 80 characters
            5. Make it engaging and professional
            6. If the current title is already good, make minor improvements only
            7. Preserve the core meaning and intent of the original title
            
            Generate only the improved job title, nothing else.
            """
            
            ai_response = get_gemini_response(prompt)
            
            if ai_response and ai_response.strip():
                generated_title = ai_response.strip()
                # Clean up the response (remove quotes, extra spaces, etc.)
                generated_title = generated_title.replace('"', '').replace("'", "").strip()
                
                # Ensure it's not too long
                if len(generated_title) > 80:
                    generated_title = generated_title[:77] + "..."
                
                return Response({
                    "generatedTitle": generated_title,
                    "message": "Title generated successfully"
                }, status=200)
            else:
                raise Exception("AI response was empty")
                
        except ImportError:
            print("Gemini AI not available, using fallback title generation")
            # Fallback to keyword-based title generation
            generated_title = generate_title_fallback(current_title)
            return Response({
                "generatedTitle": generated_title,
                "message": "Title generated successfully (fallback method)"
            }, status=200)
            
        except Exception as ai_error:
            print(f"AI generation failed: {ai_error}")
            # Fallback to keyword-based title generation
            generated_title = generate_title_fallback(current_title)
            return Response({
                "generatedTitle": generated_title,
                "message": "Title generated successfully (fallback method)"
            }, status=200)
            
    except Exception as e:
        print(f"Error generating job title: {e}")
        import traceback
        traceback.print_exc()
        return Response({
            "message": "Failed to generate job title. Please try again.",
            "error": str(e)
        }, status=500)


def generate_title_fallback(current_title):
    """Fallback method to improve job title based on keywords"""
    title_lower = current_title.lower()
    
    # Define keyword mappings for different job types
    job_keywords = {
        "web": ["web", "website", "frontend", "backend", "full stack", "mern", "react", "node", "javascript", "html", "css"],
        "mobile": ["mobile", "app", "ios", "android", "flutter", "react native", "swift", "kotlin"],
        "design": ["design", "ui", "ux", "graphic", "visual", "creative", "figma", "sketch", "adobe"],
        "content": ["content", "writing", "blog", "article", "copy", "seo", "marketing"],
        "data": ["data", "analysis", "python", "sql", "excel", "analytics", "machine learning", "ai"],
        "marketing": ["marketing", "social media", "digital", "seo", "sem", "advertising", "campaign"],
        "admin": ["admin", "virtual assistant", "data entry", "customer service", "support"],
        "translation": ["translation", "language", "localization", "multilingual"],
        "legal": ["legal", "law", "contract", "compliance", "document"],
        "accounting": ["accounting", "bookkeeping", "finance", "tax", "quickbooks", "excel"]
    }
    
    # Find the most relevant job type
    job_type = None
    max_matches = 0
    
    for category, keywords in job_keywords.items():
        matches = sum(1 for keyword in keywords if keyword in title_lower)
        if matches > max_matches:
            max_matches = matches
            job_type = category
    
    # Improve title based on detected job type and current title
    if job_type == "web":
        if "web" not in title_lower and "developer" not in title_lower:
            return current_title.replace("Need", "Need a Web Developer for").replace("Hire", "Hire a Web Developer for")
        return current_title
    elif job_type == "mobile":
        if "mobile" not in title_lower and "app" not in title_lower:
            return current_title.replace("Need", "Need a Mobile App Developer for").replace("Hire", "Hire a Mobile App Developer for")
        return current_title
    elif job_type == "design":
        if "design" not in title_lower and "ui" not in title_lower and "ux" not in title_lower:
            return current_title.replace("Need", "Need a UI/UX Designer for").replace("Hire", "Hire a UI/UX Designer for")
        return current_title
    elif job_type == "content":
        if "content" not in title_lower and "writer" not in title_lower:
            return current_title.replace("Need", "Need a Content Writer for").replace("Hire", "Hire a Content Writer for")
        return current_title
    elif job_type == "data":
        if "data" not in title_lower and "analyst" not in title_lower:
            return current_title.replace("Need", "Need a Data Analyst for").replace("Hire", "Hire a Data Analyst for")
        return current_title
    elif job_type == "marketing":
        if "marketing" not in title_lower:
            return current_title.replace("Need", "Need a Digital Marketing Specialist for").replace("Hire", "Hire a Digital Marketing Specialist for")
        return current_title
    elif job_type == "admin":
        if "admin" not in title_lower and "assistant" not in title_lower:
            return current_title.replace("Need", "Need a Virtual Assistant for").replace("Hire", "Hire a Virtual Assistant for")
        return current_title
    elif job_type == "translation":
        if "translation" not in title_lower and "translator" not in title_lower:
            return current_title.replace("Need", "Need a Translator for").replace("Hire", "Hire a Translator for")
        return current_title
    elif job_type == "legal":
        if "legal" not in title_lower and "law" not in title_lower:
            return current_title.replace("Need", "Need a Legal Consultant for").replace("Hire", "Hire a Legal Consultant for")
        return current_title
    elif job_type == "accounting":
        if "accounting" not in title_lower and "accountant" not in title_lower:
            return current_title.replace("Need", "Need an Accountant for").replace("Hire", "Hire an Accountant for")
        return current_title
    else:
        # If no specific category detected, just ensure it starts with an action word
        if not any(word in title_lower for word in ["need", "hire", "looking", "seeking"]):
            return f"Need {current_title}"
        return current_title


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
def get_job_attachment_details(request, id):
    """Get attachment metadata (filename, size, etc.) without downloading the file"""
    try:
        attachment = JobAttachment.objects.get(id=id)
        
        attachment_data = {
            "id": str(attachment.id),
            "fileName": attachment.fileName,
            "contentType": attachment.contentType,
            "fileSize": attachment.fileSize,
            "downloadUrl": f"http://localhost:5000/api/auth/jobposts/attachments/{attachment.id}"
        }
        
        return Response(attachment_data, status=200)

    except JobAttachment.DoesNotExist:
        return Response({"message": "Attachment not found"}, status=404)
    except Exception as e:
        return Response(
            {"message": "Error retrieving attachment details", "error": str(e)}, status=500
        )


@api_view(["GET"])
def get_job_post_details(request, job_id):
    try:
        job_post = JobPosts.objects(id=job_id).first()

        if not job_post:
            return Response({"message": "Job Post not found"}, status=404)

        # Get attachment details if attachment exists
        attachment_details = None
        if job_post.attachments:
            try:
                # Extract attachment ID from the URL
                attachment_id = job_post.attachments.split('/')[-1]
                attachment = JobAttachment.objects(id=attachment_id).first()
                if attachment:
                    attachment_details = {
                        "id": str(attachment.id),
                        "fileName": attachment.fileName,
                        "contentType": attachment.contentType,
                        "fileSize": attachment.fileSize,
                        "downloadUrl": job_post.attachments
                    }
            except Exception as e:
                print(f"Error fetching attachment details: {e}")
                # If attachment details can't be fetched, still return job details
                pass

        serializer = JobPostSerializer(job_post)
        response_data = serializer.data
        
        # Add attachment details to response
        if attachment_details:
            response_data["attachmentDetails"] = attachment_details

        return Response(response_data)

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
            job_post = JobPosts(
                userId=user_id, 
                status="draft", 
                title="",
                createdAt=timezone.now(),
                updatedAt=timezone.now()
            )
            job_post.save()

        return Response({"jobPostId": str(job_post.id)}, status=status.HTTP_200_OK)

    except Exception as e:
        print("Error fetching or creating draft job post:", e)
        return Response(
            {"message": "Internal server error", "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def add_job_post_category(request):
    """Add or update category for a job post"""
    job_id = request.data.get("jobId")
    category_id = request.data.get("categoryId")

    if not job_id or not category_id:
        return Response(
            {"message": "Job ID and Category ID are required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Verify the category exists
        category = Category.objects(id=category_id).first()
        if not category:
            return Response(
                {"message": "Category not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Get the job post
        job_post = JobPosts.objects(id=job_id).first()
        if not job_post:
            return Response(
                {"message": "Job post not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Update category
        job_post.categoryId = category
        job_post.updatedAt = timezone.now()
        job_post.save()

        return Response(
            {
                "message": "Category added successfully",
                "jobPostId": str(job_post.id),
                "category": {"id": str(category.id), "name": category.name}
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        print("Error saving category:", e)
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
        # Fetch jobs sorted by posted time in descending order (newest first)
        # If postedTime is not available, fall back to createdAt
        job_posts = JobPosts.objects.all().order_by('-postedTime', '-createdAt')

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
            attachment_link = f"http://localhost:5000/api/auth/jobproposals/attachments/{new_attachment.id}"

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
        
        # Enhanced data with freelancer profile information
        enhanced_proposals = []
        
        for proposal in proposals:
            # Get basic proposal data
            proposal_data = {
                "id": str(proposal.id),
                "jobId": str(proposal.jobId.id),
                "userId": str(proposal.userId.id),
                "projectScope": proposal.projectScope,
                "bidAmount": float(proposal.bidAmount) if proposal.bidAmount else 0,
                "serviceFee": float(proposal.serviceFee) if proposal.serviceFee else 0,
                "youReceive": float(proposal.youReceive) if proposal.youReceive else 0,
                "projectDuration": proposal.projectDuration,
                "coverLetter": proposal.coverLetter,
                "attachment": proposal.attachment,
                "status": proposal.status,
                "createdAt": proposal.createdAt,
                "updatedAt": proposal.updatedAt,
            }
            
            # Get freelancer profile information
            freelancer_user = proposal.userId
            freelancer_profile = Requests.objects(userId=freelancer_user).first()
            
            if freelancer_profile:
                # Calculate freelancer stats
                all_freelancer_proposals = JobProposals.objects(userId=freelancer_user)
                completed_proposals = all_freelancer_proposals.filter(status='completed')
                total_earnings = sum([float(p.youReceive or 0) for p in completed_proposals])
                
                # Calculate job success rate
                total_proposals = all_freelancer_proposals.count()
                completed_count = completed_proposals.count()
                job_success = int((completed_count / total_proposals) * 100) if total_proposals > 0 else 0
                
                # Get skills
                skills = []
                if freelancer_profile.skills:
                    skills = [{"id": str(skill.id), "name": skill.name} for skill in freelancer_profile.skills]
                
                # Add freelancer data to proposal
                proposal_data["freelancer"] = {
                    "id": str(freelancer_user.id),
                    "name": freelancer_user.name,
                    "email": freelancer_user.email,
                    "location": freelancer_profile.country or "Not specified",
                    "specialization": freelancer_profile.title or "Freelancer",
                    "profilePicture": freelancer_profile.photograph or None,
                    "hourlyRate": float(freelancer_profile.hourlyRate) if freelancer_profile.hourlyRate else 0,
                    "skills": skills,
                    "completedJobs": completed_count,
                    "totalHours": 0,  # This would need to be calculated from actual work data
                    "totalEarned": total_earnings,
                    "jobSuccess": job_success,
                    "bio": freelancer_profile.bio or "",
                    "onlineStatus": getattr(freelancer_user, "onlineStatus", "offline"),
                }
            else:
                # Fallback data if no profile found
                proposal_data["freelancer"] = {
                    "id": str(freelancer_user.id),
                    "name": freelancer_user.name,
                    "email": freelancer_user.email,
                    "location": "Not specified",
                    "specialization": "Freelancer",
                    "profilePicture": None,
                    "hourlyRate": 0,
                    "skills": [],
                    "completedJobs": 0,
                    "totalHours": 0,
                    "totalEarned": 0,
                    "jobSuccess": 0,
                    "bio": "",
                    "onlineStatus": "offline",
                }
            
            enhanced_proposals.append(proposal_data)
        
        return Response({"success": True, "proposals": enhanced_proposals})
    except Exception as e:
        print("Error fetching proposals for job:", e)
        return Response({"success": False, "message": str(e)}, status=500)


@api_view(["GET"])
@verify_token
def fetch_proposals_by_freelancer(request):
    """Fetch all proposals submitted by the authenticated freelancer"""
    try:
        user_id = request.user.id
        
        # Get all proposals submitted by this freelancer
        proposals = JobProposals.objects(userId=user_id).order_by('-createdAt')
        
        proposals_data = []
        for proposal in proposals:
            # Get job details
            job = JobPosts.objects(id=proposal.jobId.id).first()
            if not job:
                continue
                
            # Get client details
            client = User.objects(id=job.userId.id).first()
            
            proposal_data = {
                "id": str(proposal.id),
                "jobId": str(proposal.jobId.id),
                "projectScope": proposal.projectScope,
                "bidAmount": float(proposal.bidAmount) if proposal.bidAmount else 0,
                "serviceFee": float(proposal.serviceFee) if proposal.serviceFee else 0,
                "youReceive": float(proposal.youReceive) if proposal.youReceive else 0,
                "projectDuration": proposal.projectDuration,
                "coverLetter": proposal.coverLetter,
                "attachment": proposal.attachment,
                "status": proposal.status,
                "createdAt": proposal.createdAt.isoformat() if proposal.createdAt else None,
                "updatedAt": proposal.updatedAt.isoformat() if proposal.updatedAt else None,
                "viewedByClient": getattr(proposal, 'viewedByClient', False),  # Add viewed status
                "job": {
                    "id": str(job.id),
                    "title": job.title,
                    "description": job.description,
                    "budgetType": job.budgetType,
                    "hourlyRateFrom": float(job.hourlyRateFrom) if job.hourlyRateFrom else 0,
                    "hourlyRateTo": float(job.hourlyRateTo) if job.hourlyRateTo else 0,
                    "fixedRate": float(job.fixedRate) if job.fixedRate else 0,
                    "scopeOfWork": job.scopeOfWork,
                    "ws_token": job.ws_token,
                    "duration": job.duration,
                    "experienceLevel": job.experienceLevel,
                    "postedTime": job.postedTime.isoformat() if job.postedTime else None,
                },
                "client": {
                    "id": str(client.id) if client else None,
                    "name": client.name if client else "Unknown Client",
                }
            }
            proposals_data.append(proposal_data)
        
        return Response(
            {
                "success": True,
                "proposals": proposals_data
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
def mark_proposal_viewed(request, proposal_id):
    """Mark a proposal as viewed by client"""
    try:
        # Get the proposal
        proposal = JobProposals.objects(id=proposal_id).first()
        if not proposal:
            return Response(
                {"success": False, "message": "Proposal not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Mark as viewed
        proposal.viewedByClient = True
        proposal.save()
        
        return Response(
            {"success": True, "message": "Proposal marked as viewed"},
            status=status.HTTP_200_OK,
        )
        
    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@verify_token
def shortlist_proposal(request):
    """Shortlist a proposal"""
    try:
        proposal_id = request.data.get("proposalId")
        action = request.data.get("action")  # "shortlist" or "unshortlist"
        
        if not proposal_id:
            return Response({"success": False, "message": "Proposal ID is required"}, status=400)
        
        proposal = JobProposals.objects(id=proposal_id).first()
        if not proposal:
            return Response({"success": False, "message": "Proposal not found"}, status=404)
        
        # Update proposal status or add shortlist flag
        if action == "shortlist":
            proposal.status = "shortlisted"
        elif action == "unshortlist":
            proposal.status = "submitted"
        
        proposal.save()
        
        return Response({"success": True, "message": f"Proposal {action}ed successfully"})
        
    except Exception as e:
        print("Error shortlisting proposal:", e)
        return Response({"success": False, "message": str(e)}, status=500)


@api_view(["POST"])
@verify_token
def archive_proposal(request):
    """Archive a proposal"""
    try:
        proposal_id = request.data.get("proposalId")
        
        if not proposal_id:
            return Response({"success": False, "message": "Proposal ID is required"}, status=400)
        
        proposal = JobProposals.objects(id=proposal_id).first()
        if not proposal:
            return Response({"success": False, "message": "Proposal not found"}, status=404)
        
        proposal.status = "archived"
        proposal.save()
        
        return Response({"success": True, "message": "Proposal archived successfully"})
        
    except Exception as e:
        print("Error archiving proposal:", e)
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
            "photograph": True if user.profileImage else None,  # Only use User model for photograph
            "title": req.title,
            "country": req.country,
            "hourlyRate": float(req.hourlyRate) if hasattr(req, 'hourlyRate') and req.hourlyRate else 0,
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
            "photograph": True if user.profileImage else None,  # Only use User model for photograph
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
            "phoneVerified": getattr(user, "phoneVerified", False),
        }

        # Calculate hires and spent
        job_ids = JobPosts.objects(userId=user.id).only('id')
        proposals = JobProposals.objects(jobId__in=job_ids, status='completed')
        unique_freelancers = set(str(p.userId.id) for p in proposals if hasattr(p, 'userId'))
        hires = len(unique_freelancers)
        spent = sum(float(p.youReceive or 0) for p in proposals)
        # Add online status, last seen, createdAt, hires, spent
        profile_data.update({
            "onlineStatus": getattr(user, "onlineStatus", None),
            "lastSeen": getattr(user, "lastSeen", None),
            "createdAt": getattr(user, "createdAt", None),
            "hires": hires,
            "spent": spent,
        })
        
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
            "logo": True if company_profile and company_profile.logo else None,
            
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
    """Initiate a PayPal payment using Orders API v2"""
    import requests
    import base64
    import uuid
    from django.conf import settings
    from .models import PaymentTransaction
    from django.utils import timezone
    
    try:
        user_id = request.user.id
        amount = request.data.get('amount')
        original_currency = request.data.get('currency', 'INR')
        description = request.data.get('description', 'Worksyde Payment')
        job_offer_id = request.data.get('jobOfferId')
        
        print(f"PayPal payment initiation started for user: {request.user}")
        print(f"Request data: {request.data}")
        
        if not amount:
            return Response(
                {"success": False, "message": "Amount is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Convert INR to USD for PayPal (PayPal doesn't support INR directly)
        if original_currency == 'INR':
            # Simple conversion rate (you can use real-time rates)
            usd_amount = round(float(amount) / 83, 2)
            if usd_amount < 1.00:
                usd_amount = 1.00  # PayPal minimum
            paypal_currency = 'USD'
            print(f"Currency conversion: ₹{amount} → ${usd_amount} USD")
        else:
            usd_amount = float(amount)
            paypal_currency = original_currency
        
        # Generate unique transaction ID
        transaction_id = str(uuid.uuid4())
        
        # Get PayPal access token
        auth_url = "https://api.sandbox.paypal.com/v1/oauth2/token"
        
        auth_string = f"{settings.PAYPAL_CLIENT_ID}:{settings.PAYPAL_CLIENT_SECRET}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        auth_headers = {
            'Authorization': f'Basic {auth_b64}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        auth_data = 'grant_type=client_credentials'
        auth_response = requests.post(auth_url, headers=auth_headers, data=auth_data)
        
        if auth_response.status_code != 200:
            print(f"PayPal authentication failed: {auth_response.status_code} - {auth_response.text}")
            return Response(
                {"success": False, "message": "Failed to authenticate with PayPal."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        access_token = auth_response.json()['access_token']
        print(f"PayPal access token obtained successfully")
        
        # Create PayPal order using Orders API v2
        orders_url = "https://api.sandbox.paypal.com/v2/checkout/orders"
        
        order_data = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "amount": {
                    "currency_code": paypal_currency,
                    "value": f"{usd_amount:.2f}"
                },
                "description": description
            }],
            "application_context": {
                "return_url": f"http://localhost:3000/payment/success?transactionId={transaction_id}",
                "cancel_url": f"http://localhost:3000/payment/cancel?transactionId={transaction_id}",
                "shipping_preference": "NO_SHIPPING"
            }
        }
        
        order_headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
            'PayPal-Request-Id': transaction_id
        }
        
        print(f"Sending order data to PayPal: {order_data}")
        
        order_response = requests.post(orders_url, headers=order_headers, json=order_data)
        
        print(f"PayPal API response status: {order_response.status_code}")
        print(f"PayPal API response: {order_response.text}")
        
        if order_response.status_code == 201:
            order = order_response.json()
            order_id = order['id']
            
            # Create transaction record in database
            transaction = PaymentTransaction(
                transactionId=transaction_id,
                paypalOrderId=order_id,
                userId=request.user,
                jobOfferId=job_offer_id,
                amount=float(amount),  # Store original INR amount
                currency=original_currency,  # Store original currency
                description=f"{description} (PayPal: ${usd_amount} USD)",
                paymentMethod='paypal',
                status='pending',
                paypalResponse=order
            )
            transaction.save()
            
            return Response(
                {
                    "success": True,
                    "message": "PayPal order created successfully.",
                    "paypalOrderId": order_id,
                    "transactionId": transaction_id,
                    "originalAmount": amount,
                    "originalCurrency": original_currency,
                    "paypalAmount": usd_amount,
                    "paypalCurrency": paypal_currency
                },
                status=status.HTTP_200_OK,
            )
        else:
            print("Error while creating PayPal order:")
            print(order_response.text)
            return Response(
                {
                    "success": False,
                    "message": "Failed to create PayPal order.",
                    "error": order_response.text
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        
    except Exception as e:
        import traceback
        print(f"PayPal payment initiation error: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        return Response(
            {"success": False, "message": f"Error initiating payment: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@verify_token
def complete_paypal_payment(request):
    """Complete a PayPal payment using Orders API v2"""
    import requests
    import base64
    from django.conf import settings
    from .models import PaymentTransaction
    from django.utils import timezone
    
    try:
        user_id = request.user.id
        paypal_order_id = request.data.get('paypalOrderId')
        
        if not paypal_order_id:
            return Response(
                {"success": False, "message": "PayPal order ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        print(f"Completing PayPal payment for order: {paypal_order_id}")
        
        # Get PayPal access token
        auth_url = "https://api.sandbox.paypal.com/v1/oauth2/token"
        
        auth_string = f"{settings.PAYPAL_CLIENT_ID}:{settings.PAYPAL_CLIENT_SECRET}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        auth_headers = {
            'Authorization': f'Basic {auth_b64}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        auth_data = 'grant_type=client_credentials'
        auth_response = requests.post(auth_url, headers=auth_headers, data=auth_data)
        
        if auth_response.status_code != 200:
            print(f"PayPal authentication failed: {auth_response.status_code} - {auth_response.text}")
            return Response(
                {"success": False, "message": "Failed to authenticate with PayPal."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        access_token = auth_response.json()['access_token']
        
        # Capture the PayPal order
        capture_url = f"https://api.sandbox.paypal.com/v2/checkout/orders/{paypal_order_id}/capture"
        
        capture_headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        print(f"Capturing PayPal order: {paypal_order_id}")
        capture_response = requests.post(capture_url, headers=capture_headers, json={})
        
        print(f"PayPal capture response status: {capture_response.status_code}")
        print(f"PayPal capture response: {capture_response.text}")
        
        if capture_response.status_code == 201:
            capture_data = capture_response.json()
            
            # Update transaction status
            try:
                transaction = PaymentTransaction.objects.get(paypalOrderId=paypal_order_id)
                transaction.status = 'completed'
                transaction.paypalPaymentId = capture_data.get('id')
                transaction.completedAt = timezone.now()
                transaction.paypalResponse = capture_data
                transaction.save()
                
                # Update wallet balance if this is a wallet payment
                print(f"Transaction description: {transaction.description}")
                print(f"Transaction jobOfferId: {transaction.jobOfferId}")
                
                # Check if this is a wallet payment (no job offer ID and description contains wallet/top-up)
                is_wallet_payment = (
                    transaction.jobOfferId is None and 
                    transaction.description and 
                    ("wallet" in transaction.description.lower() or "top-up" in transaction.description.lower())
                )
                
                print(f"Is wallet payment: {is_wallet_payment}")
                
                if is_wallet_payment:
                    try:
                        user = User.objects.get(id=request.user.id)
                        print(f"Current wallet balance: {user.walletBalance}")
                        # Convert decimal to float for the addition
                        amount_float = float(transaction.amount)
                        user.walletBalance += amount_float
                        user.save()
                        print(f"Wallet balance updated for user {user.id}: +₹{amount_float}, new balance: {user.walletBalance}")
                        
                        # Refresh the user object to get updated balance
                        user.refresh_from_db()
                        print(f"After refresh - wallet balance: {user.walletBalance}")
                    except Exception as wallet_error:
                        print(f"Error updating wallet balance: {wallet_error}")
                        import traceback
                        print(f"Wallet error traceback: {traceback.format_exc()}")
                else:
                    print(f"Not a wallet payment - jobOfferId: {transaction.jobOfferId}, description: {transaction.description}")
                
                print(f"Payment completed successfully for transaction: {transaction.transactionId}")
                
                # Get the updated user object to return correct wallet balance
                updated_user = User.objects.get(id=request.user.id)
                
                # If this was a wallet payment and balance wasn't updated, try to update it now
                if (transaction.jobOfferId is None and 
                    transaction.description and 
                    ("wallet" in transaction.description.lower() or "top-up" in transaction.description.lower()) and
                    updated_user.walletBalance == 0):
                    
                    print("Attempting to update wallet balance as fallback...")
                    try:
                        # Convert decimal to float for the addition
                        amount_float = float(transaction.amount)
                        updated_user.walletBalance += amount_float
                        updated_user.save()
                        print(f"Fallback wallet balance update: +₹{amount_float}, new balance: {updated_user.walletBalance}")
                    except Exception as fallback_error:
                        print(f"Fallback wallet update failed: {fallback_error}")
                
                # Final check - get the user again to ensure we have the latest balance
                final_user = User.objects.get(id=request.user.id)
                print(f"Final wallet balance check: {final_user.walletBalance}")
                
                return Response(
                    {
                        "success": True,
                        "message": "PayPal payment completed successfully.",
                        "orderId": paypal_order_id,
                        "captureId": capture_data.get('id'),
                        "transactionId": transaction.transactionId,
                        "amount": transaction.amount,
                        "currency": transaction.currency,
                        "status": capture_data.get('status'),
                        "walletBalance": final_user.walletBalance
                    },
                    status=status.HTTP_200_OK,
                )
            except PaymentTransaction.DoesNotExist:
                print(f"Transaction record not found for order: {paypal_order_id}")
                return Response(
                    {"success": False, "message": "Transaction record not found."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            print("Error while capturing PayPal order:")
            print(capture_response.text)
            
            # Update transaction status to failed
            try:
                transaction = PaymentTransaction.objects.get(paypalOrderId=paypal_order_id)
                transaction.status = 'failed'
                transaction.paypalResponse = capture_response.json() if capture_response.text else {}
                transaction.save()
            except PaymentTransaction.DoesNotExist:
                pass
            
            return Response(
                {
                    "success": False,
                    "message": "PayPal order capture failed.",
                    "error": capture_response.text
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        
    except Exception as e:
        import traceback
        print(f"PayPal payment completion error: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        return Response(
            {"success": False, "message": f"Error completing payment: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@verify_token
def initiate_wallet_payment(request):
    """Initiate a PayPal payment for wallet top-up"""
    import requests
    import base64
    import uuid
    from django.conf import settings
    from .models import PaymentTransaction
    from django.utils import timezone
    
    try:
        user_id = request.user.id
        amount = request.data.get('amount')
        
        print(f"Wallet payment initiation started for user: {request.user}")
        print(f"Request data: {request.data}")
        
        if not amount:
            return Response(
                {"success": False, "message": "Amount is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Validate amount
        try:
            amount = float(amount)
            if amount <= 0:
                return Response(
                    {"success": False, "message": "Amount must be greater than 0."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except ValueError:
            return Response(
                {"success": False, "message": "Invalid amount format."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Convert INR to USD for PayPal
        usd_amount = round(amount / 83, 2)
        if usd_amount < 1.00:
            usd_amount = 1.00  # PayPal minimum
        
        # Generate unique transaction ID
        transaction_id = str(uuid.uuid4())
        
        # Get PayPal access token
        auth_url = "https://api.sandbox.paypal.com/v1/oauth2/token"
        
        auth_string = f"{settings.PAYPAL_CLIENT_ID}:{settings.PAYPAL_CLIENT_SECRET}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        auth_headers = {
            'Authorization': f'Basic {auth_b64}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        auth_data = 'grant_type=client_credentials'
        auth_response = requests.post(auth_url, headers=auth_headers, data=auth_data)
        
        if auth_response.status_code != 200:
            print(f"PayPal authentication failed: {auth_response.status_code} - {auth_response.text}")
            return Response(
                {"success": False, "message": "Failed to authenticate with PayPal."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        access_token = auth_response.json()['access_token']
        print(f"PayPal access token obtained successfully")
        
        # Create PayPal order for wallet top-up
        orders_url = "https://api.sandbox.paypal.com/v2/checkout/orders"
        
        order_data = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "amount": {
                    "currency_code": "USD",
                    "value": f"{usd_amount:.2f}"
                },
                "description": f"Wallet Top-up: ₹{amount} INR"
            }],
            "application_context": {
                "return_url": f"http://localhost:3000/payment/success?transactionId={transaction_id}",
                "cancel_url": f"http://localhost:3000/payment/cancel?transactionId={transaction_id}",
                "shipping_preference": "NO_SHIPPING"
            }
        }
        
        order_headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
            'PayPal-Request-Id': transaction_id
        }
        
        print(f"Sending wallet order data to PayPal: {order_data}")
        
        order_response = requests.post(orders_url, headers=order_headers, json=order_data)
        
        print(f"PayPal API response status: {order_response.status_code}")
        print(f"PayPal API response: {order_response.text}")
        
        if order_response.status_code == 201:
            order = order_response.json()
            order_id = order['id']
            
            # Create transaction record in database
            transaction = PaymentTransaction(
                transactionId=transaction_id,
                paypalOrderId=order_id,
                userId=request.user,
                jobOfferId=None,  # No job offer for wallet payments
                amount=amount,  # Store original INR amount
                currency="INR",
                description=f"Wallet Top-up: ₹{amount} INR (PayPal: ${usd_amount} USD)",
                paymentMethod='paypal',
                status='pending',
                paypalResponse=order
            )
            transaction.save()
            
            return Response(
                {
                    "success": True,
                    "message": "PayPal order created successfully for wallet top-up.",
                    "paypalOrderId": order_id,
                    "transactionId": transaction_id,
                    "originalAmount": amount,
                    "originalCurrency": "INR",
                    "paypalAmount": usd_amount,
                    "paypalCurrency": "USD"
                },
                status=status.HTTP_200_OK,
            )
        else:
            print("Error while creating PayPal order for wallet:")
            print(order_response.text)
            return Response(
                {
                    "success": False,
                    "message": "Failed to create PayPal order for wallet top-up.",
                    "error": order_response.text
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        
    except Exception as e:
        import traceback
        print(f"Wallet payment initiation error: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        return Response(
            {"success": False, "message": f"Error initiating wallet payment: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@verify_token
def get_wallet_balance(request):
    """Get the current wallet balance for the authenticated user"""
    try:
        user = User.objects.get(id=request.user.id)
        wallet_balance = getattr(user, 'walletBalance', 0.0)
        print(f"User {user.id} wallet balance: {wallet_balance}")
        return Response(
            {
                "success": True,
                "walletBalance": wallet_balance
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        print(f"Error in get_wallet_balance: {e}")
        return Response(
            {"success": False, "message": f"Error fetching wallet balance: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@verify_token
def get_payment_transactions(request):
    """Get payment transactions for a user"""
    try:
        user_id = request.user.id
        
        # Get all transactions for the user
        transactions = PaymentTransaction.objects.filter(userId=user_id).order_by('-createdAt')
        
        transaction_list = []
        for transaction in transactions:
            transaction_list.append({
                "transactionId": transaction.transactionId,
                "paypalOrderId": transaction.paypalOrderId,
                "amount": transaction.amount,
                "currency": transaction.currency,
                "description": transaction.description,
                "status": transaction.status,
                "paymentMethod": transaction.paymentMethod,
                "createdAt": transaction.createdAt,
                "completedAt": transaction.completedAt,
                "jobOfferId": transaction.jobOfferId
            })
        
        return Response(
            {
                "success": True,
                "transactions": transaction_list
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
            
            try:
                # Read the file data
                logo_data = logo.read()
                logo_content_type = logo.content_type
                
                # Store image data directly in database
                company_obj.logo = logo_data
                company_obj.logoContentType = logo_content_type
                print(f"Logo saved to database successfully: {len(logo_data)} bytes, type: {logo_content_type}")
            except Exception as e:
                print(f"Error saving logo to database: {e}")
                return Response({"message": "Error saving logo to database", "error": str(e)}, status=500)
            
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
            "logoContentType": company.logoContentType,
            "createdAt": company.createdAt,
            "updatedAt": company.updatedAt,
        }
        
        return Response(company_data)
    except Exception as e:
        print("Error in get_company_details:", e)
        return Response({"message": "Server error", "error": str(e)}, status=500)


@api_view(["GET"])
def get_company_logo(request, user_id):
    """Serve company logo image from database"""
    try:
        company = Company.objects(userId=user_id).first()
        if not company or not company.logo:
            return Response({"message": "Logo not found"}, status=404)
        
        # Create HTTP response with image data
        from django.http import HttpResponse
        response = HttpResponse(company.logo, content_type=company.logoContentType)
        response['Content-Disposition'] = 'inline'
        return response
        
    except Exception as e:
        print("Error serving company logo:", e)
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


@api_view(["POST"])
@verify_token
def publish_job_post(request, job_id):
    try:
        job_post = JobPosts.objects(id=job_id).first()
        if not job_post:
            return Response({"success": False, "message": "Job post not found."}, status=404)
        # Only the owner can publish
        if str(job_post.userId.id) != str(request.user.id):
            return Response({"success": False, "message": "Unauthorized."}, status=403)
        job_post.status = "verified"
        job_post.save()
        return Response({"success": True, "message": "Job post published successfully."}, status=200)
    except Exception as e:
        return Response({"success": False, "message": str(e)}, status=500)


@api_view(["DELETE"]) 
@verify_token
def delete_job_post(request, job_id):
    try:
        job_post = JobPosts.objects(id=job_id).first()
        if not job_post:
            return Response({"success": False, "message": "Job post not found."}, status=404)
        # Only the owner can delete
        if str(job_post.userId.id) != str(request.user.id):
            return Response({"success": False, "message": "Unauthorized."}, status=403)

        job_post.delete()
        return Response({"success": True, "message": "Job post deleted successfully."}, status=200)
    except Exception as e:
        return Response({"success": False, "message": str(e)}, status=500)


@api_view(["GET"])
def get_verified_freelancers(request):
    """
    Returns a list of freelancers whose Requests.status is 'verified'.
    """
    try:
        # Find all users with role 'freelancer'
        freelancers = User.objects(role="freelancer")
        print(f"Total freelancers found: {freelancers.count()}")
        verified_freelancers = []
        for user in freelancers:
            req = Requests.objects(userId=user, status="approved").first()
            print(f"Freelancer {user.name} (ID: {user.id}) - Request status: {req.status if req else 'No request found'}")
            if req:
                # Calculate earnings and job success rate
                proposals = JobProposals.objects(userId=user)
                total_earnings = sum([float(p.youReceive or 0) for p in proposals])
                completed_count = sum(1 for p in proposals if getattr(p, 'status', None) == 'completed')
                job_success = int((completed_count / proposals.count()) * 100) if proposals.count() > 0 else 0
                
                # Format location
                location_parts = []
                if hasattr(req, 'city') and req.city:
                    location_parts.append(req.city)
                if hasattr(req, 'country') and req.country:
                    location_parts.append(req.country)
                location = ", ".join(location_parts) if location_parts else "N/A"
                
                # Format earnings
                if total_earnings > 0:
                    if total_earnings >= 1000:
                        earned_display = f"₹{int(total_earnings/1000)}K+ earned"
                    else:
                        earned_display = f"₹{int(total_earnings)}+ earned"
                else:
                    earned_display = "₹0 earned"
                
                verified_freelancers.append({
                    "id": str(user.id),
                    "name": user.name,
                    "email": user.email,
                    "title": req.title,
                    "location": location,
                    "rate": float(req.hourlyRate) if hasattr(req, 'hourlyRate') and req.hourlyRate else 0,
                    "jobSuccess": job_success,
                    "earned": earned_display,
                    "totalEarnings": total_earnings,
                    "avatar": True if user.profileImage else None,  # Only use User model for photograph
                    "skills": [{"id": str(s.id), "name": s.name} for s in getattr(req, 'skills', [])],
                    "bio": req.bio if hasattr(req, 'bio') else None,
                    "onlineStatus": user.onlineStatus if hasattr(user, 'onlineStatus') else "offline",
                    "lastSeen": user.lastSeen if hasattr(user, 'lastSeen') else None,
                })
        
        # If no approved freelancers found, show freelancers with any request status
        if not verified_freelancers:
            print("No approved freelancers found, showing freelancers with any request status...")
            for user in freelancers:
                req = Requests.objects(userId=user).first()
                if req:
                    print(f"Freelancer {user.name} (ID: {user.id}) - Request status: {req.status}")
                    # Calculate earnings and job success rate
                    proposals = JobProposals.objects(userId=user)
                    total_earnings = sum([float(p.youReceive or 0) for p in proposals])
                    completed_count = sum(1 for p in proposals if getattr(p, 'status', None) == 'completed')
                    job_success = int((completed_count / proposals.count()) * 100) if proposals.count() > 0 else 0
                    
                    # Format location
                    location_parts = []
                    if hasattr(req, 'city') and req.city:
                        location_parts.append(req.city)
                    if hasattr(req, 'country') and req.country:
                        location_parts.append(req.country)
                    location = ", ".join(location_parts) if location_parts else "N/A"
                    
                    # Format earnings
                    if total_earnings > 0:
                        if total_earnings >= 1000:
                            earned_display = f"₹{int(total_earnings/1000)}K+ earned"
                        else:
                            earned_display = f"₹{int(total_earnings)}+ earned"
                    else:
                        earned_display = "₹0 earned"
                    
                    verified_freelancers.append({
                        "id": str(user.id),
                        "name": user.name,
                        "email": user.email,
                        "title": req.title,
                        "location": location,
                        "rate": float(req.hourlyRate) if hasattr(req, 'hourlyRate') and req.hourlyRate else 0,
                        "jobSuccess": job_success,
                        "earned": earned_display,
                        "totalEarnings": total_earnings,
                        "avatar": True if user.profileImage else None,
                        "skills": [{"id": str(s.id), "name": s.name} for s in getattr(req, 'skills', [])],
                        "bio": req.bio if hasattr(req, 'bio') else None,
                        "onlineStatus": user.onlineStatus if hasattr(user, 'onlineStatus') else "offline",
                        "lastSeen": user.lastSeen if hasattr(user, 'lastSeen') else None,
                    })
        
        print(f"Returning {len(verified_freelancers)} freelancers")
        return Response({"success": True, "freelancers": verified_freelancers})
    except Exception as e:
        return Response({"success": False, "message": str(e)}, status=500)


@api_view(["POST"])
@verify_token
def create_job_invitation(request):
    user = request.user  # client
    job_id = request.data.get("jobId")
    freelancer_id = request.data.get("freelancerId")
    message = request.data.get("message", "")
    if not job_id or not freelancer_id:
        return Response({"success": False, "message": "Missing jobId or freelancerId"}, status=400)
    # Check for existing invitation
    existing = JobInvitation.objects(jobId=job_id, clientId=user.id, freelancerId=freelancer_id).first()
    if existing:
        return Response({"success": False, "message": "Already invited"}, status=409)
    # Check invites left
    job = JobPosts.objects(id=job_id).first()
    if not job:
        return Response({"success": False, "message": "Job not found"}, status=404)
    if job.invites <= 0:
        return Response({"success": False, "message": "No invites left"}, status=400)
    # Create invitation
    invitation = JobInvitation(
        jobId=job,
        clientId=user,
        freelancerId=freelancer_id,
        message=message
    )
    invitation.save()
    # Decrement invites
    job.invites -= 1
    job.save()
    return Response({"success": True, "invitation": JobInvitationSerializer(invitation).data, "invites": job.invites})

@api_view(["GET"])
@verify_token
def list_job_invitations(request):
    user = request.user  # client
    job_id = request.query_params.get("jobId")
    if not job_id:
        return Response({"success": False, "message": "Missing jobId"}, status=400)
    invitations = JobInvitation.objects(jobId=job_id, clientId=user.id)
    data = JobInvitationSerializer(invitations, many=True).data
    invited_freelancer_ids = [inv["freelancerId"] for inv in data]
    return Response({"success": True, "invitations": data, "invitedFreelancerIds": invited_freelancer_ids})

@api_view(["DELETE"])
@verify_token
def delete_job_invitation(request):
    user = request.user  # client
    job_id = request.data.get("jobId")
    freelancer_id = request.data.get("freelancerId")
    if not job_id or not freelancer_id:
        return Response({"success": False, "message": "Missing jobId or freelancerId"}, status=400)
    invitation = JobInvitation.objects(jobId=job_id, clientId=user.id, freelancerId=freelancer_id).first()
    if not invitation:
        return Response({"success": False, "message": "Invitation not found"}, status=404)
    invitation.delete()
    # Increment invites in JobPosts
    job = JobPosts.objects(id=job_id).first()
    if job:
        job.invites += 1
        job.save()
    # Return updated invited count
    invited_count = JobInvitation.objects(jobId=job_id, clientId=user.id).count()
    return Response({"success": True, "invitedCount": invited_count, "invites": job.invites if job else None})

@api_view(["GET"])
@verify_token
def list_freelancer_invitations(request):
    user = request.user  # freelancer
    invitations = JobInvitation.objects(freelancerId=user.id)
    data = JobInvitationSerializer(invitations, many=True).data
    return Response({"success": True, "invitations": data})

@api_view(["POST"])
@verify_token
def decline_job_invitation(request):
    """
    Decline a job invitation: delete JobInvitation and create DeclinedJobInvitation
    Expects: jobId, clientId, reason, message, blockFuture
    """
    user = request.user  # freelancer
    job_id = request.data.get("jobId")
    client_id = request.data.get("clientId")
    reason = request.data.get("reason")
    message = request.data.get("message")
    block_future = request.data.get("blockFuture", False)

    if not job_id or not client_id or not reason:
        return Response({"success": False, "message": "Missing required fields."}, status=400)

    # Delete the JobInvitation
    from Auth.models import JobInvitation, JobPosts, User
    invitation = JobInvitation.objects(jobId=job_id, freelancerId=str(user.id)).first()
    if not invitation:
        return Response({"success": False, "message": "Invitation not found."}, status=404)
    invitation.delete()

    # Create DeclinedJobInvitation
    declined = DeclinedJobInvitation(
        jobId=job_id,
        clientId=client_id,
        freelancerId=str(user.id),
        reason=reason,
        message=message,
        blockFuture=block_future
    )
    declined.save()

    # Optionally increment job.invites
    job = JobPosts.objects(id=job_id).first()
    if job:
        job.invites += 1
        job.save()

    # Create notification for the client
    try:
        from Auth.models import Notification
        notification = Notification(
            recipientId=User.objects.get(id=client_id),
            senderId=user,
            jobId=JobPosts.objects.get(id=job_id),
            notificationType='job_invitation_declined',
            title='Job Invitation Declined',
            message=f'The freelancer has declined your job invitation for "{job.title if job else "the project"}"',
            additionalData={
                'declineReason': reason,
                'declineMessage': message,
                'freelancerId': str(user.id),
                'freelancerName': user.name,
                'jobTitle': job.title if job else "Unknown Project",
                'blockFuture': block_future
            }
        )
        notification.save()
    except Exception as notif_err:
        print('Warning: decline notification creation failed:', notif_err)

    return Response({"success": True, "message": "Invitation declined."})

@api_view(["POST"])
@verify_token
def accept_job_invitation(request):
    """
    Accept a job invitation: delete JobInvitation and create notification
    Expects: jobId, clientId, acceptanceMessage (optional)
    """
    user = request.user  # freelancer
    job_id = request.data.get("jobId")
    client_id = request.data.get("clientId")
    acceptance_message = request.data.get("acceptanceMessage", "")

    if not job_id or not client_id:
        return Response({"success": False, "message": "Missing required fields."}, status=400)

    # Delete the JobInvitation
    from Auth.models import JobInvitation, JobPosts, User
    invitation = JobInvitation.objects(jobId=job_id, freelancerId=str(user.id)).first()
    if not invitation:
        return Response({"success": False, "message": "Invitation not found."}, status=404)
    
    # Get job details before deleting invitation
    job = JobPosts.objects(id=job_id).first()
    if not job:
        return Response({"success": False, "message": "Job not found."}, status=404)
    
    invitation.delete()

    # Create notification for the client
    try:
        from Auth.models import Notification
        notification = Notification(
            recipientId=User.objects.get(id=client_id),
            senderId=user,
            jobId=job,
            notificationType='job_invitation_accepted',
            title='Job Invitation Accepted',
            message=f'The freelancer has accepted your job invitation for "{job.title}"',
            additionalData={
                'acceptanceMessage': acceptance_message,
                'freelancerId': str(user.id),
                'freelancerName': user.name,
                'jobTitle': job.title,
                'jobId': str(job.id)
            }
        )
        notification.save()
    except Exception as notif_err:
        print('Warning: accept notification creation failed:', notif_err)

    return Response({"success": True, "message": "Invitation accepted."})

@api_view(["GET"])
@verify_token
def get_declined_job_invitations(request, job_id):
    """
    Get declined job invitations for a specific job
    """
    try:
        user = request.user  # client
        
        # Verify the job belongs to the client
        job = JobPosts.objects(id=job_id, userId=str(user.id)).first()
        if not job:
            return Response({"success": False, "message": "Job not found or access denied"}, status=404)
        
        # Get declined invitations for this job
        declined_invitations = DeclinedJobInvitation.objects(jobId=job_id)
        
        # Prepare response data with freelancer details
        invitations_data = []
        for invitation in declined_invitations:
            try:
                # Since freelancerId is a ReferenceField, it automatically dereferences to the User object
                freelancer = invitation.freelancerId
                if freelancer:
                    # Get freelancer's skills
                    freelancer_request = Requests.objects(userId=str(freelancer.id)).first()
                    skills = []
                    if freelancer_request and freelancer_request.skills:
                        skills = [skill.name for skill in freelancer_request.skills]
                    
                    invitation_data = {
                        "id": str(invitation.id),
                        "jobId": str(invitation.jobId),
                        "clientId": str(invitation.clientId),
                        "freelancerId": str(freelancer.id),
                        "reason": invitation.reason,
                        "message": invitation.message,
                        "blockFuture": invitation.blockFuture,
                        "createdAt": invitation.createdAt,
                        "freelancer": {
                            "id": str(freelancer.id),
                            "name": freelancer.name,
                            "email": freelancer.email,
                            "location": freelancer_request.city + ", " + freelancer_request.country if freelancer_request and freelancer_request.city and freelancer_request.country else "Not specified",
                            "specialization": freelancer_request.bio if freelancer_request and freelancer_request.bio else "Freelancer",
                            "profilePicture": freelancer_request.photograph if freelancer_request and freelancer_request.photograph else None,
                            "completedJobs": 0,  # You can add logic to count completed jobs
                            "totalHours": 0,     # You can add logic to calculate total hours
                            "totalEarned": 0,    # You can add logic to calculate total earnings
                            "hourlyRate": str(freelancer_request.hourlyRate) if freelancer_request and freelancer_request.hourlyRate else "0.00",
                            "skills": skills
                        },
                        "coverLetter": invitation.message or "No cover letter provided"
                    }
                    invitations_data.append(invitation_data)
            except Exception as e:
                print(f"Error processing invitation {invitation.id}: {str(e)}")
                continue
        
        return Response({
            "success": True, 
            "data": invitations_data,
            "count": len(invitations_data)
        })
    except Exception as e:
        print(f"Error in get_declined_job_invitations: {str(e)}")
        return Response({"success": False, "message": "Internal server error"}, status=500)


@api_view(["GET"])
def get_freelancer_complete_profile(request, user_id):
    """
    Get complete freelancer profile information including all details
    """
    try:
        # Get user basic info
        user = User.objects(id=user_id).first()
        if not user:
            return Response({"message": "User not found"}, status=404)
        
        # Get profile info
        req = Requests.objects(userId=user).first()
        if not req:
            return Response({"message": "Profile not found"}, status=404)
        
        # Get work experiences
        try:
            work_experiences = WorkExperience.objects(userId=user)
        except Exception as e:
            print(f"Error fetching work experiences: {e}")
            work_experiences = []
        
        # Get education
        try:
            educations = Education.objects(userId=user)
        except Exception as e:
            print(f"Error fetching education: {e}")
            educations = []
        
        # Get languages from the Requests object (they are embedded documents)
        languages = req.languages if hasattr(req, 'languages') else []
        
        # Get other experiences
        try:
            other_experiences = OtherExperience.objects(userId=user)
        except Exception as e:
            print(f"Error fetching other experiences: {e}")
            other_experiences = []
        
        # Calculate earnings and job success rate
        proposals = JobProposals.objects(userId=user)
        total_earnings = sum([float(p.youReceive or 0) for p in proposals])
        completed_count = sum(1 for p in proposals if getattr(p, 'status', None) == 'completed')
        job_success = int((completed_count / proposals.count()) * 100) if proposals.count() > 0 else 0
        
        # Format location
        location_parts = []
        if hasattr(req, 'city') and req.city:
            location_parts.append(req.city)
        if hasattr(req, 'country') and req.country:
            location_parts.append(req.country)
        location = ", ".join(location_parts) if location_parts else "N/A"
        
        # Compose comprehensive response
        data = {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "title": req.title,
            "location": location,
            "hourlyRate": float(req.hourlyRate) if hasattr(req, 'hourlyRate') and req.hourlyRate else 0,
            "photograph": True if user.profileImage else None,  # Only use User model for photograph
            "bio": req.bio if hasattr(req, 'bio') else None,
            "skills": [{"id": str(s.id), "name": s.name} for s in getattr(req, 'skills', [])],
            "totalEarnings": total_earnings,
            "jobSuccess": job_success,
            "onlineStatus": getattr(user, "onlineStatus", "offline"),
            "lastSeen": getattr(user, "lastSeen", None),
            "createdAt": getattr(user, "createdAt", None),
            
            # Work Experiences
            "workExperiences": [
                {
                    "id": str(exp.id),
                    "company": getattr(exp, 'company', ''),
                    "position": getattr(exp, 'title', ''),  # Using title field from model
                    "startDate": getattr(exp, 'startDate', None),
                    "endDate": getattr(exp, 'endDate', None),
                    "isCurrent": getattr(exp, 'isCurrent', False),
                    "description": getattr(exp, 'description', '')
                } for exp in work_experiences
            ],
            
            # Education
            "education": [
                {
                    "id": str(edu.id),
                    "school": getattr(edu, 'school', ''),  # Using lowercase school field from model
                    "degree": getattr(edu, 'degree', ''),
                    "fieldOfStudy": getattr(edu, 'fieldOfStudy', ''),
                    "startYear": getattr(edu, 'startYear', None),
                    "endYear": getattr(edu, 'endYear', None),
                    "isExpected": getattr(edu, 'isExpected', False)
                } for edu in educations
            ],
            
            # Languages
            "languages": [
                {
                    "id": str(idx),  # Use index as ID since embedded documents don't have IDs
                    "name": getattr(lang, 'name', ''),
                    "proficiency": getattr(lang, 'proficiency', '')
                } for idx, lang in enumerate(languages)
            ],
            
            # Other Experiences
            "otherExperiences": [
                {
                    "id": str(exp.id),
                    "title": getattr(exp, 'subject', ''),  # Using subject field from model
                    "description": getattr(exp, 'description', ''),
                    "startDate": getattr(exp, 'createdAt', None),  # Using createdAt as startDate
                    "endDate": getattr(exp, 'updatedAt', None),  # Using updatedAt as endDate
                    "isCurrent": False  # Default to False since model doesn't have isCurrent
                } for exp in other_experiences
            ],
            
            # Profile details
            "phone": getattr(req, 'phone', None),
            "city": getattr(req, 'city', None),
            "country": getattr(req, 'country', None),
            "timezone": getattr(req, 'timezone', None),
            "hoursPerWeek": getattr(req, 'hoursPerWeek', None),
            "experience": getattr(req, 'experience', None),
            "videoIntroduction": getattr(req, 'videoIntroduction', None),
            "resume": getattr(req, 'resume', None),
        }
        
        return Response({"success": True, "freelancer": data})
        
    except Exception as e:
        print("Error in get_freelancer_complete_profile:", e)
        return Response({"success": False, "message": "Server error", "error": str(e)}, status=500)


# Job Offer Views
@api_view(["POST"])
@verify_token
def create_job_offer(request):
    """Create a new job offer"""
    try:
        data = request.data
        user_id = request.user.id
        
        print("Debug - Received data:", data)
        print("Debug - User ID:", user_id)
        
        # Validate required fields
        required_fields = ['freelancerId', 'jobId', 'contractTitle', 'projectAmount']
        for field in required_fields:
            if field not in data:
                return Response({"success": False, "message": f"Missing required field: {field}"}, status=400)
        
        # Get the client (current user)
        try:
            client = User.objects.get(id=user_id)
            print("Debug - Client found:", client.name)
        except User.DoesNotExist:
            return Response({"success": False, "message": "Client not found"}, status=404)
        
        # Get the freelancer
        try:
            freelancer = User.objects.get(id=data['freelancerId'])
            print("Debug - Freelancer found:", freelancer.name)
        except User.DoesNotExist:
            return Response({"success": False, "message": "Freelancer not found"}, status=404)
        
        # Get the job
        try:
            job = JobPosts.objects.get(id=data['jobId'])
            print("Debug - Job found:", job.title)
        except JobPosts.DoesNotExist:
            return Response({"success": False, "message": "Job not found"}, status=404)
        
        # Parse due date if provided (support ISO, "Jan, 15 2024", and timestamps)
        due_date = None
        if data.get('dueDate'):
            raw_due = data.get('dueDate')
            try:
                # Try ISO format first (e.g., 2024-01-15T00:00:00Z)
                from datetime import datetime
                due_date = datetime.fromisoformat(str(raw_due).replace('Z', '+00:00'))
                print("Debug - Due date parsed (ISO):", due_date)
            except Exception:
                parsed = None
                # Try display string format from frontend date picker (e.g., "Jan, 15 2024")
                try:
                    from datetime import datetime
                    parsed = datetime.strptime(str(raw_due), "%b, %d %Y")
                    print("Debug - Due date parsed (display string):", parsed)
                except Exception:
                    # Try numeric timestamps (seconds or milliseconds)
                    try:
                        raw_num = float(raw_due)
                        # Heuristic: seconds if < 1e12
                        if raw_num < 1000000000000:
                            raw_num = raw_num * 1000
                        from datetime import datetime
                        parsed = datetime.fromtimestamp(raw_num / 1000.0)
                        print("Debug - Due date parsed (timestamp):", parsed)
                    except Exception:
                        parsed = None
                if not parsed:
                    return Response({"success": False, "message": "Invalid due date format"}, status=400)
                due_date = parsed
        
        # Process milestones if provided
        milestones_data = data.get('milestones', [])
        print("Debug - Milestones data:", milestones_data)
        
        # Transform milestones to match Milestone model structure
        transformed_milestones = []
        for milestone in milestones_data:
            print(f"Debug - Processing milestone: {milestone}")
            
            # Parse amount (remove ₹ symbol and convert to decimal)
            amount_str = milestone.get('amount', '₹0').replace('₹', '').strip()
            try:
                amount_decimal = float(amount_str) if amount_str else 0.0
            except ValueError:
                amount_decimal = 0.0
            
            # Parse due date if provided
            milestone_due_date = None
            if milestone.get('dueDate'):
                try:
                    # Parse date string like "Jan, 15 2024"
                    date_str = milestone['dueDate']
                    # Convert to datetime object
                    from datetime import datetime
                    milestone_due_date = datetime.strptime(date_str, "%b, %d %Y")
                except ValueError:
                    print(f"Warning: Could not parse milestone due date: {milestone['dueDate']}")
            
            # Create Milestone object with only the fields that exist in the model
            from Auth.models import Milestone
            milestone_data = {
                'title': milestone.get('description', ''),  # Frontend sends 'description', model expects 'title'
                'dueDate': milestone_due_date,
                'amount': amount_decimal
            }
            print(f"Debug - Milestone data to create: {milestone_data}")
            
            transformed_milestone = Milestone(**milestone_data)
            transformed_milestones.append(transformed_milestone)
        
        print("Debug - Transformed milestones:", transformed_milestones)
        
        # Transform payment schedule to match model choices
        payment_schedule = data.get('paymentSchedule', 'fixed_price')
        print(f"Debug - Original payment schedule: {payment_schedule}")
        
        # Map frontend payment schedule values to backend model choices
        payment_schedule_mapping = {
            'whole-project': 'fixed_price',
            'milestones': 'milestone',
            'hourly': 'hourly'
        }
        
        if payment_schedule in payment_schedule_mapping:
            payment_schedule = payment_schedule_mapping[payment_schedule]
            print(f"Debug - Transformed payment schedule: {payment_schedule}")
        
        # Create the job offer
        job_offer_data = {
            'clientId': client,
            'freelancerId': freelancer,
            'jobId': job,
            'contractTitle': data['contractTitle'],
            'workDescription': data.get('workDescription', ''),
            'projectAmount': data['projectAmount'],
            'paymentSchedule': payment_schedule,
            'dueDate': due_date,
            'attachments': data.get('attachments', ''),
            'milestones': transformed_milestones
        }
        print("Debug - Job offer data:", job_offer_data)
        
        job_offer = JobOffer(**job_offer_data)
        
        print("Debug - About to save job offer")
        job_offer.save()
        print("Debug - Job offer saved successfully")
        
        # Delete the corresponding job proposal if it exists
        try:
            from Auth.models import JobProposals
            # Find and delete the job proposal from this freelancer for this job
            proposal = JobProposals.objects(jobId=job, userId=freelancer).first()
            if proposal:
                print(f"Debug - Found job proposal {proposal.id}, deleting it")
                proposal.delete()
                print("Debug - Job proposal deleted successfully")
                
                # Decrement the applicants count for the job
                job.applicants = max(0, job.applicants - 1)
                job.save()
                print(f"Debug - Updated job applicants count to {job.applicants}")
                
                # Create a notification for the freelancer
                try:
                    from Auth.models import Notification
                    notification = Notification(
                        recipientId=freelancer,
                        senderId=client,
                        notificationType="proposal_accepted",
                        title="Proposal Accepted!",
                        message=f"Your proposal for '{job.title}' has been accepted and converted to a job offer by {client.name}.",
                        jobId=job,
                        additionalData={"offerId": str(job_offer.id)}
                    )
                    notification.save()
                    print("Debug - Notification created for freelancer")
                except Exception as notif_error:
                    print(f"Warning: Error creating notification: {notif_error}")
                    # Don't fail the job offer creation if notification creation fails
            else:
                print("Debug - No job proposal found to delete")
        except Exception as proposal_error:
            print(f"Warning: Error deleting job proposal: {proposal_error}")
            # Don't fail the job offer creation if proposal deletion fails
        
        return Response({
            "success": True, 
            "message": "Job offer created successfully",
            "jobOfferId": str(job_offer.id)
        }, status=201)
        
    except Exception as e:
        print("Error in create_job_offer:", e)
        import traceback
        print("Full traceback:", traceback.format_exc())
        return Response({"success": False, "message": "Server error", "error": str(e)}, status=500)


@api_view(["GET"])
@verify_token
def get_job_offer(request, offer_id):
    """Get a specific job offer by ID"""
    try:
        # Get the job offer
        try:
            job_offer = JobOffer.objects.get(id=offer_id)
        except JobOffer.DoesNotExist:
            return Response({"success": False, "message": "Job offer not found"}, status=404)
        
        # Prepare response data
        data = {
            "id": str(job_offer.id),
            "clientId": str(job_offer.clientId.id),
            "freelancerId": str(job_offer.freelancerId.id),
            "jobId": str(job_offer.jobId.id),
            "contractTitle": job_offer.contractTitle,
            "workDescription": job_offer.workDescription,
            "projectAmount": job_offer.projectAmount,
            "paymentSchedule": job_offer.paymentSchedule,
            "dueDate": job_offer.dueDate.isoformat() if job_offer.dueDate else None,
            "attachments": job_offer.attachments,
            "status": job_offer.status,
            "offerExpires": job_offer.offerExpires.isoformat() if job_offer.offerExpires else None,
            "milestones": [
                {
                    "title": milestone.title,
                    "dueDate": milestone.dueDate.isoformat() if milestone.dueDate else None,
                    "amount": str(milestone.amount) if milestone.amount else "0"
                } for milestone in job_offer.milestones
            ],
            "createdAt": job_offer.createdAt.isoformat() if job_offer.createdAt else None,
            "updatedAt": job_offer.updatedAt.isoformat() if job_offer.updatedAt else None
        }
        
        return Response({"success": True, "jobOffer": data})
        
    except Exception as e:
        print("Error in get_job_offer:", e)
        return Response({"success": False, "message": "Server error", "error": str(e)}, status=500)


@api_view(["GET"])
@verify_token
def get_client_job_offers(request, client_id):
    """Get all job offers created by a client"""
    try:
        # Verify the client exists
        try:
            client = User.objects.get(id=client_id)
        except User.DoesNotExist:
            return Response({"success": False, "message": "Client not found"}, status=404)
        
        # Get job offers
        job_offers = JobOffer.objects(clientId=client).order_by('-createdAt')
        
        # Prepare response data
        offers_data = []
        for offer in job_offers:
            offer_data = {
                "id": str(offer.id),
                "freelancerId": str(offer.freelancerId.id),
                "freelancerName": offer.freelancerId.name,
                "jobId": str(offer.jobId.id),
                "jobTitle": offer.jobId.title,
                "contractTitle": offer.contractTitle,
                "projectAmount": offer.projectAmount,
                "status": offer.status,
                "offerExpires": offer.offerExpires.isoformat() if offer.offerExpires else None,
                "createdAt": offer.createdAt.isoformat() if offer.createdAt else None
            }
            offers_data.append(offer_data)
        
        return Response({"success": True, "jobOffers": offers_data})
        
    except Exception as e:
        print("Error in get_client_job_offers:", e)
        return Response({"success": False, "message": "Server error", "error": str(e)}, status=500)


@api_view(["GET"])
@verify_token
def get_freelancer_job_offers(request, freelancer_id):
    """Get all job offers received by a freelancer"""
    try:
        # Verify the freelancer exists
        try:
            freelancer = User.objects.get(id=freelancer_id)
        except User.DoesNotExist:
            return Response({"success": False, "message": "Freelancer not found"}, status=404)
        
        # Get job offers
        job_offers = JobOffer.objects(freelancerId=freelancer).order_by('-createdAt')
        
        # Prepare response data
        offers_data = []
        for offer in job_offers:
            offer_data = {
                "id": str(offer.id),
                "clientId": str(offer.clientId.id),
                "clientName": offer.clientId.name,
                "jobId": str(offer.jobId.id),
                "jobTitle": offer.jobId.title,
                "contractTitle": offer.contractTitle,
                "projectAmount": offer.projectAmount,
                "status": offer.status,
                "offerExpires": offer.offerExpires.isoformat() if offer.offerExpires else None,
                "createdAt": offer.createdAt.isoformat() if offer.createdAt else None
            }
            offers_data.append(offer_data)
        
        return Response({"success": True, "jobOffers": offers_data})
        
    except Exception as e:
        print("Error in get_freelancer_job_offers:", e)
        return Response({"success": False, "message": "Server error", "error": str(e)}, status=500)


@api_view(["PUT"])
@verify_token
def update_job_offer(request, offer_id):
    """Update a job offer"""
    try:
        data = request.data
        
        # Get the job offer
        try:
            job_offer = JobOffer.objects.get(id=offer_id)
        except JobOffer.DoesNotExist:
            return Response({"success": False, "message": "Job offer not found"}, status=404)
        
        # Update fields if provided
        if 'contractTitle' in data:
            job_offer.contractTitle = data['contractTitle']
        if 'workDescription' in data:
            job_offer.workDescription = data['workDescription']
        if 'projectAmount' in data:
            job_offer.projectAmount = data['projectAmount']
        if 'paymentSchedule' in data:
            job_offer.paymentSchedule = data['paymentSchedule']
        if 'attachments' in data:
            job_offer.attachments = data['attachments']
        if 'status' in data:
            job_offer.status = data['status']
        if 'milestones' in data:
            job_offer.milestones = data['milestones']
        
        # Parse due date if provided
        if 'dueDate' in data:
            if data['dueDate']:
                try:
                    job_offer.dueDate = datetime.fromisoformat(data['dueDate'].replace('Z', '+00:00'))
                except ValueError:
                    return Response({"success": False, "message": "Invalid due date format"}, status=400)
            else:
                job_offer.dueDate = None
        
        # Parse offer expiration date if provided
        if 'offerExpires' in data:
            if data['offerExpires']:
                try:
                    job_offer.offerExpires = datetime.fromisoformat(data['offerExpires'].replace('Z', '+00:00'))
                except ValueError:
                    return Response({"success": False, "message": "Invalid offer expiration date format"}, status=400)
            else:
                job_offer.offerExpires = None
        
        job_offer.save()
        
        return Response({"success": True, "message": "Job offer updated successfully"})
        
    except Exception as e:
        print("Error in update_job_offer:", e)
        return Response({"success": False, "message": "Server error", "error": str(e)}, status=500)


@api_view(["DELETE"])
@verify_token
def delete_job_offer(request, offer_id):
    """Delete a job offer"""
    try:
        # Get the job offer
        try:
            job_offer = JobOffer.objects.get(id=offer_id)
        except JobOffer.DoesNotExist:
            return Response({"success": False, "message": "Job offer not found"}, status=404)
        
        # Check if the current user is the client who created the offer
        if str(job_offer.clientId.id) != str(request.user.id):
            return Response({"success": False, "message": "You can only delete offers you created"}, status=403)
        
        job_offer.delete()
        
        return Response({"success": True, "message": "Job offer deleted successfully"})
        
    except Exception as e:
        print("Error in delete_job_offer:", e)
        return Response({"success": False, "message": "Server error", "error": str(e)}, status=500)


@api_view(["POST"])
@verify_token
def decline_job_offer(request, offer_id):
    """Decline a job offer, refund escrow to client, delete it, and notify client"""
    try:
        data = request.data
        user = request.user
        
        # Get the job offer
        try:
            job_offer = JobOffer.objects.get(id=offer_id)
        except JobOffer.DoesNotExist:
            return Response({"success": False, "message": "Job offer not found"}, status=404)
        
        # Validate that the current user is the freelancer who received the offer
        if str(job_offer.freelancerId.id) != str(user.id):
            return Response({"success": False, "message": "You can only decline offers sent to you"}, status=403)
        
        # Extract decline information
        decline_reason = data.get('declineReason', 'No reason provided')
        decline_message = data.get('declineMessage', '')
        
        # Store offer details before deletion for notification and refund calc
        client_id = job_offer.clientId.id
        job_id = job_offer.jobId.id
        contract_title = job_offer.contractTitle
        project_amount = job_offer.projectAmount
        client = job_offer.clientId
        
        # Calculate refund amount to return to client (same logic as funding: subtotal + fixed fees)
        try:
            clean_amount_str = str(project_amount).replace('₹', '').replace(',', '').strip()
            base_amount = float(clean_amount_str) if clean_amount_str else 0.0
        except Exception:
            base_amount = 0.0
        marketplace_fee = 50.0
        contract_fee = 100.0
        refund_amount = base_amount + marketplace_fee + contract_fee
        currency = 'INR'

        # Perform refund: deduct from Worksyde wallet, add back to client's wallet
        wallet = _get_or_create_worksyde_wallet()
        if wallet.balance < refund_amount:
            return Response({
                "success": False,
                "message": "Insufficient Worksyde wallet balance to process refund"
            }, status=400)
        
        old_worksyde_balance = float(wallet.balance or 0)
        old_client_balance = float(client.walletBalance or 0)
        wallet.balance = old_worksyde_balance - refund_amount
        client.walletBalance = old_client_balance + refund_amount
        # Remove escrow entry for this job/offer if present
        try:
            updated_entries = []
            removed_any = False
            for entry in wallet.entries or []:
                matches_offer = (str(getattr(entry, 'offerId', None)) == str(offer_id))
                matches_job = (str(getattr(entry, 'jobId', None).id) == str(job_id)) if getattr(entry, 'jobId', None) else False
                # Also consider acceptedOfferId link just in case
                try:
                    matches_accepted = (str(getattr(getattr(entry, 'acceptedOfferId', None), 'id', None)) == str(offer_id))
                except Exception:
                    matches_accepted = False
                if matches_offer or matches_job or matches_accepted:
                    removed_any = True
                    continue
                updated_entries.append(entry)
            wallet.entries = updated_entries
        except Exception as entry_err:
            print('Warning: failed to remove escrow entry on decline:', entry_err)
        wallet.save()
        client.save()
        
        # Record refund transaction
        refund_txn = Transaction(
            fromType="worksyde",
            toType="client",
            clientId=client,
            amount=refund_amount,
            currency=currency,
            type="Refund",
            status="Success",
        ).save()
        
        # Delete the job offer after refund is processed
        job_offer.delete()
        
        # Create notification for the client
        notification = Notification(
            recipientId=User.objects.get(id=client_id),
            senderId=user,
            jobId=JobPosts.objects.get(id=job_id),
            notificationType='job_offer_declined',
            title='Job Offer Declined',
            message=f'The freelancer has declined your job offer for "{contract_title}"',
            additionalData={
                'declineReason': decline_reason,
                'declineMessage': decline_message,
                'projectAmount': project_amount,
                'freelancerId': str(user.id),
                'freelancerName': user.name,
                'jobTitle': contract_title
            }
        )
        notification.save()

        # Create refund notification for the client
        try:
            refund_notification = Notification(
                recipientId=client,
                senderId=user,
                jobId=JobPosts.objects.get(id=job_id),
                notificationType='payment_received',
                title='Refund Processed',
                message='Your amount has been refunded to your wallet.',
                additionalData={
                    'amount': refund_amount,
                    'currency': currency,
                    'type': 'Refund',
                    'transactionId': str(refund_txn.id)
                }
            )
            refund_notification.save()
        except Exception as notif_err:
            # Do not fail the decline if notification creation fails
            print('Warning: refund notification creation failed:', notif_err)
        
        return Response({
            "success": True, 
            "message": "Job offer declined and refund processed successfully",
            "notificationId": str(notification.id),
            "refundAmount": refund_amount,
            "clientWalletBalance": client.walletBalance,
            "worksydeWalletBalance": wallet.balance
        })
        
    except User.DoesNotExist:
        return Response({"success": False, "message": "User not found"}, status=404)
    except JobPosts.DoesNotExist:
        return Response({"success": False, "message": "Job not found"}, status=404)
    except Exception as e:
        print("Error in decline_job_offer:", e)
        return Response({"success": False, "message": "Server error", "error": str(e)}, status=500)


@api_view(["POST"])
@verify_token
def accept_job_offer(request, offer_id):
    """Accept a job offer, create accepted offer record, and send notification"""
    try:
        data = request.data
        user = request.user
        
        # Debug logging
        print(f"Accept job offer request - Offer ID: {offer_id}")
        print(f"User ID: {user.id}")
        print(f"Request data: {data}")
        
        # Get the job offer
        try:
            job_offer = JobOffer.objects.get(id=offer_id)
            print(f"Found job offer: {job_offer.contractTitle}")
            print(f"Job offer status: {job_offer.status}")
            print(f"Job offer freelancer ID: {job_offer.freelancerId.id}")
        except JobOffer.DoesNotExist:
            return Response({"success": False, "message": "Job offer not found"}, status=404)
        
        # Validate that the current user is the freelancer who received the offer
        if str(job_offer.freelancerId.id) != str(user.id):
            return Response({"success": False, "message": "You can only accept offers sent to you"}, status=403)
        
        # Validate that the offer is still pending
        if job_offer.status != "pending":
            if job_offer.status == "accepted":
                return Response({"success": False, "message": "This job offer has already been accepted"}, status=400)
            elif job_offer.status == "declined":
                return Response({"success": False, "message": "This job offer has been declined and cannot be accepted"}, status=400)
            elif job_offer.status == "expired":
                return Response({"success": False, "message": "This job offer has expired and cannot be accepted"}, status=400)
            else:
                return Response({"success": False, "message": f"This offer cannot be accepted (status: {job_offer.status})"}, status=400)
        
        # Extract acceptance details
        acceptance_message = data.get('acceptanceMessage', '').strip()
        expected_start_date = data.get('expectedStartDate')
        estimated_completion_date = data.get('estimatedCompletionDate')
        terms_and_conditions = data.get('termsAndConditions', '')
        special_requirements = data.get('specialRequirements', '')
        
        # Parse date strings to datetime objects
        try:
            if expected_start_date:
                expected_start_date = datetime.fromisoformat(expected_start_date.replace('Z', '+00:00'))
            else:
                # Set default start date (2 days from now)
                from datetime import timedelta
                expected_start_date = timezone.now() + timedelta(days=2)
                
            if estimated_completion_date:
                estimated_completion_date = datetime.fromisoformat(estimated_completion_date.replace('Z', '+00:00'))
            else:
                # Set default completion date (32 days from now)
                from datetime import timedelta
                estimated_completion_date = timezone.now() + timedelta(days=32)
        except (ValueError, TypeError):
            # If date parsing fails, use current date + 30 days for completion
            from datetime import timedelta
            expected_start_date = timezone.now() + timedelta(days=2)
            estimated_completion_date = timezone.now() + timedelta(days=32)
        
        # Extract attachment details from request data
        attachment_details = data.get('attachmentDetails', {})
        
        # Validate required job offer fields
        if not job_offer.contractTitle:
            return Response({"success": False, "message": "Job offer is missing contract title"}, status=400)
        if not job_offer.projectAmount:
            return Response({"success": False, "message": "Job offer is missing project amount"}, status=400)
        
        print(f"Creating accepted job offer with contract title: {job_offer.contractTitle}")
        print(f"Project amount: {job_offer.projectAmount}")
        print(f"Expected start date: {expected_start_date}")
        print(f"Estimated completion date: {estimated_completion_date}")
        
        # Compute funded amount from PaymentTransaction records related to this job offer
        from .models import PaymentTransaction
        try:
            # Sum of completed transactions tied to this job offer by the client
            related_txns = PaymentTransaction.objects(
                jobOfferId=str(job_offer.id), status='completed'
            )
            funded_amount_total = 0.0
            for t in related_txns:
                try:
                    funded_amount_total += float(t.amount or 0)
                except Exception:
                    pass
        except Exception:
            funded_amount_total = 0.0

        # Create accepted job offer record
        try:
            accepted_offer = AcceptedJobOffer(
                originalJobOfferId=job_offer,
                clientId=job_offer.clientId,
                freelancerId=job_offer.freelancerId,
                jobId=job_offer.jobId,
                contractTitle=job_offer.contractTitle,
                workDescription=job_offer.workDescription,
                projectAmount=job_offer.projectAmount,
                paymentSchedule=job_offer.paymentSchedule,
                milestones=job_offer.milestones or [],
                attachments=job_offer.attachments,  # Copy attachments from original offer
                attachmentDetails=attachment_details,  # Store attachment metadata
                acceptanceMessage=acceptance_message,
                expectedStartDate=expected_start_date,
                estimatedCompletionDate=estimated_completion_date,
                termsAndConditions=terms_and_conditions,
                specialRequirements=special_requirements,
                fundedAmount=funded_amount_total,
            )
            accepted_offer.save()
            print(f"Successfully created accepted job offer with ID: {accepted_offer.id}")
        except Exception as save_error:
            print(f"Error creating accepted job offer: {save_error}")
            import traceback
            print("Save error traceback:", traceback.format_exc())
            return Response({"success": False, "message": "Error creating accepted job offer", "error": str(save_error)}, status=500)
        
        # Optionally update original job offer status/timestamps before deletion
        try:
            job_offer.status = "accepted"
            job_offer.acceptedAt = timezone.now()
            job_offer.fundedAmount = funded_amount_total
            job_offer.save()
        except Exception as update_offer_err:
            print("Warning: failed to update original job offer before deletion:", update_offer_err)

        # Update Worksyde wallet escrow entry to link acceptedOfferId
        try:
            wallet = _get_or_create_worksyde_wallet()
            updated = False
            for entry in wallet.entries or []:
                matches_offer = (str(getattr(entry, 'offerId', None)) == str(offer_id))
                matches_job = (str(getattr(entry, 'jobId', None).id) == str(job_offer.jobId.id)) if getattr(entry, 'jobId', None) else False
                if matches_offer or matches_job:
                    entry.acceptedOfferId = accepted_offer
                    updated = True
            if updated:
                wallet.save()
        except Exception as link_err:
            print('Warning: failed to link acceptedOfferId to Worksyde wallet entry:', link_err)
        
        # Create notification for the client
        notification = Notification(
            recipientId=job_offer.clientId,
            senderId=user,
            jobId=job_offer.jobId,
            notificationType='job_offer_accepted',
            title='Job Offer Accepted',
            message=f'The freelancer has accepted your job offer for "{job_offer.contractTitle}"',
            additionalData={
                'freelancerId': str(user.id),
                'freelancerName': user.name,
                'jobTitle': job_offer.contractTitle,
                'projectAmount': job_offer.projectAmount,
                'acceptedOfferId': str(accepted_offer.id),
                'expectedStartDate': expected_start_date,
                'estimatedCompletionDate': estimated_completion_date
            }
        )
        notification.save()

        # Delete the original job offer entry after successful acceptance and notification
        try:
            job_offer.delete()
        except Exception as del_err:
            print("Warning: failed to delete original job offer after acceptance:", del_err)
        
        return Response({
            "success": True, 
            "message": "Job offer accepted successfully",
            "acceptedOfferId": str(accepted_offer.id),
            "notificationId": str(notification.id),
            "fundedAmount": funded_amount_total
        })
        
    except User.DoesNotExist:
        return Response({"success": False, "message": "User not found"}, status=404)
    except JobPosts.DoesNotExist:
        return Response({"success": False, "message": "Job not found"}, status=404)
    except Exception as e:
        print("Error in accept_job_offer:", e)
        import traceback
        print("Full traceback:", traceback.format_exc())
        return Response({"success": False, "message": "Server error", "error": str(e)}, status=500)


@api_view(["GET"])
@verify_token
def get_freelancer_accepted_job_offers(request, freelancer_id):
    """Get all accepted job offers for a freelancer - OPTIMIZED VERSION"""
    try:
        if not freelancer_id:
            return Response({"success": True, "acceptedJobOffers": []})
        
        # Get pagination parameters
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 20))  # Reduced from 50 to 20 for faster loading
        skip = (page - 1) * page_size
        
        print(f"Fetching accepted job offers for freelancer {freelancer_id}, page {page}, size {page_size}")
        
        # Optimized query with select_related to reduce database calls
        accepted_offers = AcceptedJobOffer.objects(
            freelancerId=freelancer_id, 
            status="active"
        ).order_by('-acceptedAt').skip(skip).limit(page_size)
        
        print(f"Found {len(accepted_offers)} accepted job offers for freelancer {freelancer_id}")
        
        # Pre-fetch related data to avoid N+1 queries
        client_ids = [offer.clientId for offer in accepted_offers if offer.clientId]
        job_ids = [offer.jobId for offer in accepted_offers if offer.jobId]
        
        # Batch fetch clients and jobs
        clients = {}
        jobs = {}
        
        if client_ids:
            try:
                client_objects = User.objects(id__in=client_ids)
                clients = {str(client.id): client for client in client_objects}
                print(f"Successfully fetched {len(clients)} clients: {list(clients.keys())}")
            except Exception as e:
                print(f"Error batch fetching clients: {e}")
        else:
            print("No client IDs found in accepted offers")
        
        if job_ids:
            try:
                job_objects = JobPosts.objects(id__in=job_ids)
                jobs = {str(job.id): job for job in job_objects}
            except Exception as e:
                print(f"Error batch fetching jobs: {e}")
        
        offers_data = []
        for offer in accepted_offers:
            try:
                # Get client name from pre-fetched data
                client_name = "Client"
                if offer.clientId:
                    try:
                        # First try to get from pre-fetched clients
                        client = clients.get(str(offer.clientId.id))
                        if client and hasattr(client, 'name') and client.name:
                            client_name = client.name
                            print(f"Found client name from pre-fetch: {client_name} for offer {offer.id}")
                        else:
                            # Try to get directly from the offer's clientId reference
                            if hasattr(offer.clientId, 'name') and offer.clientId.name:
                                client_name = offer.clientId.name
                                print(f"Found client name directly: {client_name} for offer {offer.id}")
                            else:
                                print(f"Could not get client name for offer {offer.id}, using default: Client")
                    except Exception as e:
                        print(f"Error getting client name for offer {offer.id}: {e}")
                        client_name = "Client"
                else:
                    print(f"No clientId for offer {offer.id}")
                
                # Get job details from pre-fetched data
                job_title = offer.contractTitle or "Job Offer"
                work_scope = "General Development"
                
                if offer.jobId:
                    job = jobs.get(str(offer.jobId.id))
                    if job:
                        if hasattr(job, 'title') and job.title:
                            job_title = job.title
                        if hasattr(job, 'scopeOfWork') and job.scopeOfWork:
                            work_scope = job.scopeOfWork
                
                # Build offer data with minimal processing
                offer_data = {
                    "id": str(offer.id),
                    "contractTitle": offer.contractTitle or job_title,
                    "projectAmount": str(offer.projectAmount) if offer.projectAmount else "0",
                    "status": offer.status or "active",
                    "acceptedAt": offer.acceptedAt.isoformat() if offer.acceptedAt else None,
                    "fundedAmount": float(getattr(offer, 'fundedAmount', 0.0) or 0.0),
                    "clientName": client_name,
                    "jobTitle": job_title,
                    "workScope": work_scope,
                    "workDescription": offer.workDescription or "",
                    "paymentSchedule": offer.paymentSchedule or "fixed_price",
                    "expectedStartDate": offer.expectedStartDate.isoformat() if offer.expectedStartDate else None,
                    "estimatedCompletionDate": offer.estimatedCompletionDate.isoformat() if offer.estimatedCompletionDate else None
                }
                
                offers_data.append(offer_data)
                
            except Exception as offer_error:
                print(f"Error processing offer {offer.id}: {offer_error}")
                continue
        
        print(f"Successfully processed {len(offers_data)} offers for freelancer {freelancer_id}")
        return Response({
            "success": True, 
            "acceptedJobOffers": offers_data,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_offers": len(offers_data),
                "has_more": len(offers_data) == page_size
            }
        })
        
    except Exception as e:
        print("Error in get_freelancer_accepted_job_offers:", e)
        import traceback
        print("Full traceback:", traceback.format_exc())
        return Response({
            "success": True, 
            "acceptedJobOffers": [],
            "pagination": {
                "page": 1,
                "page_size": 20,
                "total_offers": 0,
                "has_more": False
            }
        })


@api_view(["GET"])
@verify_token
def get_accepted_job_offer_details(request, accepted_job_offer_id):
    """Get detailed information for a specific accepted job offer"""
    try:
        if not accepted_job_offer_id:
            return Response({"success": False, "message": "Accepted job offer ID is required"})
        
        # Fetch the accepted job offer
        try:
            accepted_offer = AcceptedJobOffer.objects.get(id=accepted_job_offer_id)
        except AcceptedJobOffer.DoesNotExist:
            return Response({"success": False, "message": "Accepted job offer not found"})
        
        # Get client and freelancer details
        client_name = "Unknown Client"
        freelancer_name = "Unknown Freelancer"
        freelancer_location = "Unknown Location"
        freelancer_online_status = "offline"
        
        try:
            if accepted_offer.clientId:
                client_name = accepted_offer.clientId.name or "Unknown Client"
                # Get client location if available
                client_location = "Location not specified"
                try:
                    if accepted_offer.clientId.location:
                        client_location = accepted_offer.clientId.location
                    elif accepted_offer.clientId.city:
                        location_parts = []
                        if accepted_offer.clientId.city:
                            location_parts.append(accepted_offer.clientId.city)
                        if accepted_offer.clientId.state:
                            location_parts.append(accepted_offer.clientId.state)
                        if accepted_offer.clientId.country:
                            location_parts.append(accepted_offer.clientId.country)
                        client_location = ", ".join(location_parts) if location_parts else "Location not specified"
                except Exception as e:
                    print(f"Error getting client location: {e}")
                    client_location = "Location not specified"
        except Exception as e:
            print(f"Error getting client details: {e}")
            client_location = "Location not specified"
        
        try:
            if accepted_offer.freelancerId:
                freelancer_name = accepted_offer.freelancerId.name or "Unknown Freelancer"
                # Get freelancer online status
                try:
                    if accepted_offer.freelancerId.onlineStatus:
                        freelancer_online_status = accepted_offer.freelancerId.onlineStatus
                except Exception as e:
                    print(f"Error getting freelancer online status: {e}")
                    freelancer_online_status = "offline"
                
                # Get freelancer location
                try:
                    freelancer_profile = Requests.objects.get(userId=accepted_offer.freelancerId.id, status="approved")
                    if freelancer_profile:
                        location_parts = []
                        if freelancer_profile.city:
                            location_parts.append(freelancer_profile.city)
                        if freelancer_profile.state:
                            location_parts.append(freelancer_profile.state)
                        if freelancer_profile.country:
                            location_parts.append(freelancer_profile.country)
                        freelancer_location = ", ".join(location_parts) if location_parts else "Location not specified"
                except Requests.DoesNotExist:
                    freelancer_location = "Location not specified"
                except Exception as e:
                    print(f"Error getting freelancer location: {e}")
                    freelancer_location = "Location not specified"
        except Exception as e:
            print(f"Error getting freelancer details: {e}")
        
        # Calculate financial data
        project_amount = 0
        if accepted_offer.projectAmount:
            try:
                # Remove currency symbols and convert to float
                clean_amount = str(accepted_offer.projectAmount).replace('₹', '').replace('$', '').replace(',', '').strip()
                project_amount = float(clean_amount) if clean_amount else 0
            except (ValueError, TypeError):
                print(f"Error converting project amount '{accepted_offer.projectAmount}' to float, using 0")
                project_amount = 0
        
        # Initialize financials; will be refined using wallet entries if available
        if accepted_offer.paymentSchedule == "fixed_price":
            in_escrow = project_amount
            milestones_paid = 0.0
            milestones_remaining = project_amount
            total_earnings = 0.0
        else:
            in_escrow = project_amount * 0.6
            milestones_paid = project_amount * 0.4
            milestones_remaining = in_escrow
            total_earnings = milestones_paid
        
        # Try to enrich financials from Worksyde wallet escrow entry
        try:
            wallet = _get_or_create_worksyde_wallet()
            estimated_payout = None
            expected_payout = None
            freelancer_fee = None
            freelancer_fee_percent = None
            entry_amount = None
            for entry in wallet.entries or []:
                matches_accepted = False
                try:
                    matches_accepted = (str(getattr(getattr(entry, 'acceptedOfferId', None), 'id', None)) == str(accepted_job_offer_id))
                except Exception:
                    matches_accepted = False
                matches_job = False
                try:
                    matches_job = (str(getattr(entry, 'jobId', None).id) == str(accepted_offer.jobId.id)) if getattr(entry, 'jobId', None) else False
                except Exception:
                    matches_job = False
                if matches_accepted or matches_job:
                    # Override in_escrow from wallet entry amount if set, and derive paid amount
                    try:
                        entry_amount = float(getattr(entry, 'amount', None) or 0.0)
                        if entry_amount >= 0:
                            in_escrow = entry_amount
                            # Derive paid from project amount - escrow
                            if project_amount and project_amount > 0:
                                milestones_paid = max(0.0, project_amount - entry_amount)
                                milestones_remaining = max(0.0, entry_amount)
                                total_earnings = milestones_paid
                    except Exception:
                        pass
                    # Pick estimated payout fields
                    try:
                        estimated_payout = float(getattr(entry, 'estimatedFreelancerPayout', None) or 0.0)
                    except Exception:
                        estimated_payout = None
                    try:
                        expected_payout = float(getattr(entry, 'expectedPayout', None) or 0.0)
                    except Exception:
                        expected_payout = None
                    try:
                        freelancer_fee = float(getattr(entry, 'freelancerFee', None) or 0.0)
                    except Exception:
                        freelancer_fee = None
                    try:
                        freelancer_fee_percent = float(getattr(entry, 'freelancerFeePercent', None) or 0.0)
                    except Exception:
                        freelancer_fee_percent = None
                    break
        except Exception as enrich_err:
            print('Warning: failed to enrich financials from wallet:', enrich_err)

        # Build contract data
        print(f"Building contract data for freelancer: {freelancer_name}")
        print(f"Freelancer location: {freelancer_location}")
        print(f"Freelancer profile image URL: https://via.placeholder.com/50x50/007674/FFFFFF?text={freelancer_name[0] if freelancer_name else 'F'}")
        
        contract_data = {
            "id": str(accepted_offer.id),
            "projectTitle": accepted_offer.contractTitle or "Project",
            "client": {
                "id": str(accepted_offer.clientId.id) if accepted_offer.clientId else None,
                "name": client_name,
                "location": client_location,
            },
            "clientName": client_name,  # Keep for backward compatibility
            "freelancer": {
                "id": str(accepted_offer.freelancerId.id) if accepted_offer.freelancerId else None,
                "name": freelancer_name,
                "profileImage": None,  # Set to None to trigger fallback
                "location": freelancer_location,
                "lastSeen": "Wed 1:11 AM",
                "onlineStatus": freelancer_online_status,
            },
            "financials": {
                "projectPrice": project_amount,
                "inEscrow": in_escrow,
                "milestonesPaid": milestones_paid,
                "milestonesRemaining": milestones_remaining,
                "totalEarnings": total_earnings,
                "paymentType": accepted_offer.paymentSchedule or "Fixed-price",
                "milestonesCount": 1,
                "remainingMilestonesCount": 1,
                # Enriched fields (may be None if not available)
                "estimatedFreelancerPayout": estimated_payout,
                "expectedPayout": expected_payout,
                "freelancerFee": freelancer_fee,
                "freelancerFeePercent": freelancer_fee_percent,
            },
            "contractDetails": {
                "workDescription": accepted_offer.workDescription or "",
                "acceptedAt": accepted_offer.acceptedAt.isoformat() if accepted_offer.acceptedAt else None,
                "expectedStartDate": accepted_offer.expectedStartDate.isoformat() if accepted_offer.expectedStartDate else None,
                "estimatedCompletionDate": accepted_offer.estimatedCompletionDate.isoformat() if accepted_offer.estimatedCompletionDate else None,
                "status": accepted_offer.status or "active",
            }
        }
        
        # Attach recent submissions (latest 5)
        try:
            submissions = ProjectSubmission.objects(acceptedOfferId=accepted_offer.id).order_by('-createdAt').limit(5)
            files = []
            for s in submissions:
                files.append({
                    'id': str(s.id),
                    'title': s.title,
                    'description': s.description,
                    'pdfLink': s.pdfLink,
                    'hasPdfFile': True if getattr(s, 'pdfFile', None) else False,
                    'createdAt': s.createdAt.isoformat() if s.createdAt else None,
                    'status': s.status,
                    'comments': [{'by': str(c.commenterId.id) if c.commenterId else None, 'text': c.text, 'createdAt': c.createdAt.isoformat() if c.createdAt else None} for c in (s.comments or [])]
                })
            contract_data['recentFiles'] = files
        except Exception as e:
            print('Warning: could not attach submissions:', e)

        return Response({"success": True, "contract": contract_data})
        
    except Exception as e:
        print("Error in get_accepted_job_offer_details:", e)
        import traceback
        print("Full traceback:", traceback.format_exc())
        return Response({
            "success": False,
            "message": "Failed to load contract details"
        })


@api_view(["GET"])
@verify_token
def get_hired_freelancers_for_job(request, job_id):
    """Get all hired freelancers for a specific job"""
    try:
        if not job_id:
            return Response({"success": True, "hiredFreelancers": []})
        
        # Fetch accepted job offers for the specific job
        accepted_offers = AcceptedJobOffer.objects(
            jobId=job_id, 
            status__in=["active", "in_progress"]
        ).order_by('-acceptedAt').limit(50)  # Limit to prevent memory issues
        
        print(f"Found {len(accepted_offers)} hired freelancers for job {job_id}")
        
        hired_freelancers_data = []
        for offer in accepted_offers:
            try:
                # Get freelancer details
                freelancer = offer.freelancerId
                if not freelancer:
                    print(f"Freelancer not found for offer {offer.id}")
                    continue
                
                # Get freelancer profile details from Requests model
                freelancer_profile = None
                try:
                    print(f"Debug: Looking for Requests with userId={freelancer.id} and status=approved")
                    freelancer_profile = Requests.objects.get(userId=freelancer.id, status="approved")
                    print(f"Debug: Found freelancer_profile: {freelancer_profile is not None}")
                except Requests.DoesNotExist:
                    print(f"Approved freelancer profile not found for user {freelancer.id}")
                    # Try to find any profile for this user
                    try:
                        any_profile = Requests.objects.filter(userId=freelancer.id).first()
                        if any_profile:
                            print(f"Debug: Found profile with status '{any_profile.status}' for user {freelancer.id}")
                            freelancer_profile = any_profile
                        else:
                            print(f"Debug: No profile at all found for user {freelancer.id}")
                    except Exception as e:
                        print(f"Debug: Error checking for any profile: {e}")
                
                # Get freelancer skills
                skills = []
                try:
                    if freelancer_profile and freelancer_profile.skills:
                        skills = [skill.name for skill in freelancer_profile.skills if skill.name]
                except Exception as skills_error:
                    print(f"Error getting skills for freelancer {freelancer.id}: {skills_error}")
                
                # Get freelancer title
                title = "Freelancer"
                try:
                    if freelancer_profile and freelancer_profile.title:
                        title = freelancer_profile.title
                except Exception as title_error:
                    print(f"Error getting title for freelancer {freelancer.id}: {title_error}")
                
                # Get freelancer location
                location = "Location not specified"
                try:
                    if freelancer_profile and freelancer_profile.city:
                        location_parts = []
                        if freelancer_profile.city:
                            location_parts.append(freelancer_profile.city)
                        if freelancer_profile.state:
                            location_parts.append(freelancer_profile.state)
                        if freelancer_profile.country:
                            location_parts.append(freelancer_profile.country)
                        location = ", ".join(location_parts) if location_parts else "Location not specified"
                except Exception as location_error:
                    print(f"Error getting location for freelancer {freelancer.id}: {location_error}")
                
                # Get hourly rate
                hourly_rate = "25.00"  # Default hourly rate
                try:
                    print(f"Debug: freelancer_profile exists: {freelancer_profile is not None}")
                    if freelancer_profile:
                        print(f"Debug: freelancer_profile.hourlyRate: {freelancer_profile.hourlyRate}")
                        print(f"Debug: type of hourlyRate: {type(freelancer_profile.hourlyRate)}")
                        if freelancer_profile.hourlyRate and freelancer_profile.hourlyRate > 0:
                            hourly_rate = str(freelancer_profile.hourlyRate)
                            print(f"Debug: Set hourly_rate to: {hourly_rate}")
                        else:
                            print(f"Debug: hourlyRate is None, empty, or 0 for freelancer {freelancer.id}")
                            # Try to get hourly rate from job post
                            try:
                                job_post = offer.jobId
                                if job_post and hasattr(job_post, 'hourlyRateFrom') and job_post.hourlyRateFrom:
                                    hourly_rate = str(job_post.hourlyRateFrom)
                                    print(f"Debug: Using hourly rate from job post: {hourly_rate}")
                                elif job_post and hasattr(job_post, 'hourlyRateTo') and job_post.hourlyRateTo:
                                    hourly_rate = str(job_post.hourlyRateTo)
                                    print(f"Debug: Using hourly rate from job post (to): {hourly_rate}")
                                else:
                                    print(f"Debug: Using default hourly rate: {hourly_rate}")
                            except Exception as job_error:
                                print(f"Debug: Error getting hourly rate from job post: {job_error}")
                                print(f"Debug: Using default hourly rate: {hourly_rate}")
                    else:
                        print(f"Debug: No freelancer_profile found for freelancer {freelancer.id}")
                        # Try to get hourly rate from job post
                        try:
                            job_post = offer.jobId
                            if job_post and hasattr(job_post, 'hourlyRateFrom') and job_post.hourlyRateFrom:
                                hourly_rate = str(job_post.hourlyRateFrom)
                                print(f"Debug: Using hourly rate from job post (no profile): {hourly_rate}")
                            else:
                                print(f"Debug: Using default hourly rate (no profile): {hourly_rate}")
                        except Exception as job_error:
                            print(f"Debug: Error getting hourly rate from job post (no profile): {job_error}")
                            print(f"Debug: Using default hourly rate (no profile): {hourly_rate}")
                except Exception as rate_error:
                    print(f"Error getting hourly rate for freelancer {freelancer.id}: {rate_error}")
                    import traceback
                    print(f"Full traceback for hourly rate error:", traceback.format_exc())
                    print(f"Debug: Using default hourly rate (error): {hourly_rate}")
                
                # Get job success percentage (default to 100% for approved freelancers)
                job_success = "100"
                
                # Get total earnings (default to 0 for now)
                total_earnings = "0"
                
                # Get completed jobs count (default to 0 for now)
                completed_jobs = 0
                
                # Get online status
                online_status = "offline"
                try:
                    if freelancer.onlineStatus:
                        online_status = freelancer.onlineStatus
                except Exception as status_error:
                    print(f"Error getting online status for freelancer {freelancer.id}: {status_error}")
                
                # Build freelancer data
                freelancer_data = {
                    "id": str(freelancer.id),
                    "acceptedJobOfferId": str(offer.id),
                    "name": freelancer.name or "Unknown Freelancer",
                    "title": title,
                    "location": location,
                    "hourlyRate": hourly_rate,
                    "jobSuccess": job_success,
                    "completedJobs": completed_jobs,
                    "earnings": total_earnings,
                    "skills": skills,
                    "onlineStatus": online_status,
                    # Job acceptance data
                    "acceptedAt": offer.acceptedAt.isoformat() if offer.acceptedAt else None,
                    "acceptanceMessage": offer.acceptanceMessage or f"{freelancer.name} accepted the job offer for this project.",
                    "lastCommunication": offer.acceptanceMessage or f"{freelancer.name} accepted the job offer for this project.",
                    "estimatedCompletionDate": offer.estimatedCompletionDate.isoformat() if offer.estimatedCompletionDate else None,
                    "projectAmount": str(offer.projectAmount) if offer.projectAmount else "0",
                    # Additional contract data
                    "contractTitle": offer.contractTitle or "No title provided",
                    "workDescription": offer.workDescription or "No work description provided",
                    "paymentSchedule": offer.paymentSchedule or "fixed_price",
                    "status": offer.status or "active",
                }
                
                print(f"Processed hired freelancer {freelancer.id}: {freelancer_data['name']} for job {job_id}")
                
                hired_freelancers_data.append(freelancer_data)
                
            except Exception as freelancer_error:
                print(f"Error processing hired freelancer for offer {offer.id}: {freelancer_error}")
                import traceback
                print(f"Full traceback for offer {offer.id}:", traceback.format_exc())
                continue
        
        print(f"Successfully processed {len(hired_freelancers_data)} hired freelancers for job {job_id}")
        return Response({
            "success": True, 
            "hiredFreelancers": hired_freelancers_data
        })
        
    except Exception as e:
        print("Error in get_hired_freelancers_for_job:", e)
        import traceback
        print("Full traceback:", traceback.format_exc())
        # Return empty array on error instead of failing completely
        return Response({
            "success": True, 
            "hiredFreelancers": []
        })


# Notification Endpoints
@api_view(["POST"])
@verify_token
def create_notification(request):
    """Create a new notification"""
    try:
        data = request.data
        user = request.user
        
        # Validate required fields
        required_fields = ['recipientId', 'notificationType', 'title', 'message']
        for field in required_fields:
            if field not in data:
                return Response({"success": False, "message": f"Missing required field: {field}"}, status=400)
        
        # Create notification
        notification = Notification(
            recipientId=User.objects.get(id=data['recipientId']),
            notificationType=data['notificationType'],
            title=data['title'],
            message=data['message'],
            additionalData=data.get('additionalData', {})
        )
        
        # Add optional fields if provided
        if 'senderId' in data:
            notification.senderId = User.objects.get(id=data['senderId'])
        if 'jobId' in data:
            notification.jobId = JobPosts.objects.get(id=data['jobId'])
        if 'proposalId' in data:
            notification.proposalId = JobProposals.objects.get(id=data['proposalId'])
        
        notification.save()
        
        return Response({
            "success": True, 
            "message": "Notification created successfully",
            "notificationId": str(notification.id)
        })
        
    except User.DoesNotExist:
        return Response({"success": False, "message": "User not found"}, status=404)
    except JobPosts.DoesNotExist:
        return Response({"success": False, "message": "Job not found"}, status=404)
    except JobProposals.DoesNotExist:
        return Response({"success": False, "message": "Proposal not found"}, status=404)
    except Exception as e:
        print("Error in create_notification:", e)
        return Response({"success": False, "message": "Server error", "error": str(e)}, status=500)


@api_view(["GET"])
@verify_token
def get_user_notifications(request):
    """Get notifications for the current user"""
    try:
        user = request.user
        
        # Get query parameters
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 20))
        notification_type = request.GET.get('type')
        unread_only = request.GET.get('unread_only', 'false').lower() == 'true'
        
        # Build query
        query = {"recipientId": user}
        
        if notification_type:
            query["notificationType"] = notification_type
        if unread_only:
            query["isRead"] = False
        
        # Get notifications with pagination
        skip = (page - 1) * limit
        notifications = Notification.objects(**query).skip(skip).limit(limit)
        
        # Prepare response data
        notifications_data = []
        for notification in notifications:
            notification_data = {
                "id": str(notification.id),
                "notificationType": notification.notificationType,
                "title": notification.title,
                "message": notification.message,
                "isRead": notification.isRead,
                "createdAt": notification.createdAt.isoformat() if notification.createdAt else None,
                "additionalData": notification.additionalData
            }
            
            # Add related data if available (guard dereferencing missing refs)
            try:
                if notification.senderId:
                    notification_data["senderId"] = str(notification.senderId.id)
                    notification_data["senderName"] = getattr(notification.senderId, 'name', None)
            except Exception:
                # Sender might have been deleted; skip
                pass

            try:
                if notification.jobId:
                    job = notification.jobId  # may raise if dangling DBRef
                    notification_data["jobId"] = str(job.id)
                    notification_data["jobTitle"] = getattr(job, 'title', None)
            except Exception:
                # Job post might have been deleted; skip fields to avoid deref error
                notification_data["jobId"] = None

            try:
                if notification.proposalId:
                    proposal = notification.proposalId  # may raise if dangling
                    notification_data["proposalId"] = str(proposal.id)
            except Exception:
                notification_data["proposalId"] = None
            
            notifications_data.append(notification_data)
        
        # Get total count for pagination
        total_count = Notification.objects(**query).count()
        
        return Response({
            "success": True,
            "notifications": notifications_data,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_count,
                "pages": (total_count + limit - 1) // limit
            }
        })
        
    except Exception as e:
        print("Error in get_user_notifications:", e)
        return Response({"success": False, "message": "Server error", "error": str(e)}, status=500)


@api_view(["PUT"])
@verify_token
def mark_notification_read(request, notification_id):
    """Mark a notification as read"""
    try:
        user = request.user
        
        # Get the notification
        try:
            notification = Notification.objects.get(id=notification_id, recipientId=user)
        except Notification.DoesNotExist:
            return Response({"success": False, "message": "Notification not found"}, status=404)
        
        notification.isRead = True
        notification.save()
        
        return Response({"success": True, "message": "Notification marked as read"})
        
    except Exception as e:
        print("Error in mark_notification_read:", e)
        return Response({"success": False, "message": "Server error", "error": str(e)}, status=500)


@api_view(["PUT"])
@verify_token
def mark_all_notifications_read(request):
    """Mark all notifications as read for the current user"""
    try:
        user = request.user
        
        # Update all unread notifications for the user
        Notification.objects(recipientId=user, isRead=False).update(isRead=True)
        
        return Response({"success": True, "message": "All notifications marked as read"})
        
    except Exception as e:
        print("Error in mark_all_notifications_read:", e)
        return Response({"success": False, "message": "Server error", "error": str(e)}, status=500)


@api_view(["DELETE"])
@verify_token
def delete_notification(request, notification_id):
    """Delete a notification"""
    try:
        user = request.user
        
        # Get the notification
        try:
            notification = Notification.objects.get(id=notification_id, recipientId=user)
        except Notification.DoesNotExist:
            return Response({"success": False, "message": "Notification not found"}, status=404)
        
        notification.delete()
        
        return Response({"success": True, "message": "Notification deleted successfully"})
        
    except Exception as e:
        print("Error in delete_notification:", e)
        return Response({"success": False, "message": "Server error", "error": str(e)}, status=500)


@api_view(["GET"])
@verify_token
def get_unread_notification_count(request):
    """Get count of unread notifications for the current user"""
    try:
        user = request.user
        
        count = Notification.objects(recipientId=user, isRead=False).count()
        
        return Response({
            "success": True,
            "unreadCount": count
        })
        
    except Exception as e:
        print("Error in get_unread_notification_count:", e)
        return Response({"success": False, "message": "Server error", "error": str(e)}, status=500)


@api_view(["POST"])
@verify_token
def withdraw_proposal_with_notification(request):
    """Withdraw a proposal and create notification for client"""
    try:
        data = request.data
        user = request.user
        
        # Validate required fields
        required_fields = ['proposalId', 'reason']
        for field in required_fields:
            if field not in data:
                return Response({"success": False, "message": f"Missing required field: {field}"}, status=400)
        
        # Get the proposal
        try:
            proposal = JobProposals.objects.get(id=data['proposalId'], userId=user)
        except JobProposals.DoesNotExist:
            return Response({"success": False, "message": "Proposal not found"}, status=404)
        
        # Get job and client details
        job = proposal.jobId
        client = job.userId
        
        # Update proposal status
        proposal.status = "withdrawn"
        proposal.save()
        
        # Decrement applicants count for the job
        JobPosts.objects(id=job.id).update(dec__applicants=1)
        
        # Create notification for client
        freelancer_name = user.name
        job_title = job.title
        reason = data['reason']
        optional_message = data.get('message', '')
        
        # Build notification message
        notification_message = f"Proposal for the job '{job_title}' has been withdrawn by {freelancer_name} due to the reason: {reason}"
        if optional_message:
            notification_message += f"\n\nMessage from freelancer: {optional_message}"
        
        notification = Notification(
            recipientId=client,
            senderId=user,
            jobId=job,
            proposalId=proposal,
            notificationType="proposal_withdrawn",
            title=f"Proposal Withdrawn - {job_title}",
            message=notification_message,
            additionalData={
                "reason": reason,
                "optionalMessage": optional_message,
                "freelancerName": freelancer_name,
                "jobTitle": job_title
            }
        )
        notification.save()
        
        return Response({
            "success": True,
            "message": "Proposal withdrawn successfully and client notified"
        })
        
    except Exception as e:
        print("Error in withdraw_proposal_with_notification:", e)
        return Response({"success": False, "message": "Server error", "error": str(e)}, status=500)

