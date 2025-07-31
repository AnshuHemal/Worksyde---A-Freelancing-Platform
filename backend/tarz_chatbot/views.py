from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime
from .gemini import get_gemini_response
from .models import TarzChatMessage
import pytz
import uuid

TARZ_ID = "tarz"

@api_view(["POST"])
def tarzbot_message(request):
    user_id = request.data.get("user_id")
    message = request.data.get("message")
    session_id = request.data.get("session_id")
    if not user_id or not message or not session_id:
        return Response({"success": False, "error": "user_id, message, and session_id required"}, status=400)
    ist = pytz.timezone('Asia/Kolkata')
    now_ist = datetime.now(ist)
    # Store user message
    user_msg = TarzChatMessage(
        user_id=user_id,
        sender=user_id,
        receiver=TARZ_ID,
        content=message,
        timestamp=now_ist,
        from_ai=False,
        session_id=session_id,
    )
    user_msg.save()
    # Get Gemini response
    ai_response = get_gemini_response(message)
    ai_msg = TarzChatMessage(
        user_id=user_id,
        sender=TARZ_ID,
        receiver=user_id,
        content=ai_response,
        timestamp=datetime.now(ist),
        from_ai=True,
        session_id=session_id,
    )
    ai_msg.save()
    return Response({
        "success": True,
        "user_message": {
            "_id": str(user_msg.id),
            "user_id": user_msg.user_id,
            "sender": user_msg.sender,
            "receiver": user_msg.receiver,
            "content": user_msg.content,
            "timestamp": user_msg.timestamp.isoformat(),
            "from_ai": user_msg.from_ai,
            "session_id": user_msg.session_id,
        },
        "ai_message": {
            "_id": str(ai_msg.id),
            "user_id": ai_msg.user_id,
            "sender": ai_msg.sender,
            "receiver": ai_msg.receiver,
            "content": ai_msg.content,
            "timestamp": ai_msg.timestamp.isoformat(),
            "from_ai": ai_msg.from_ai,
            "session_id": ai_msg.session_id,
        }
    })

@api_view(["GET"])
def tarzbot_history(request):
    user_id = request.query_params.get("user_id")
    session_id = request.query_params.get("session_id")
    if not user_id or not session_id:
        return Response({"success": False, "error": "user_id and session_id required"}, status=400)
    messages = TarzChatMessage.objects(user_id=user_id, session_id=session_id).order_by("timestamp")
    messages_data = [
        {
            "_id": str(m.id),
            "user_id": m.user_id,
            "sender": m.sender,
            "receiver": m.receiver,
            "content": m.content,
            "timestamp": m.timestamp.isoformat() if m.timestamp else None,
            "from_ai": m.from_ai,
            "session_id": m.session_id,
        }
        for m in messages
    ]
    return Response({"success": True, "messages": messages_data})

@api_view(["GET"])
def tarzbot_sessions(request):
    user_id = request.query_params.get("user_id")
    if not user_id:
        return Response({"success": False, "error": "user_id required"}, status=400)
    # Get all unique session_ids for this user, most recent first
    sessions = (
        TarzChatMessage.objects(user_id=user_id)
        .order_by("-timestamp")
        .distinct("session_id")
    )
    # For each session, get the first message as the title (or timestamp)
    session_list = []
    for sid in sessions:
        first_msg = TarzChatMessage.objects(user_id=user_id, session_id=sid).order_by("timestamp").first()
        session_list.append({
            "session_id": sid,
            "title": first_msg.content[:40] if first_msg else "New Chat",
            "created_at": first_msg.timestamp.isoformat() if first_msg else None,
        })
    return Response({"success": True, "sessions": session_list})

@api_view(["POST"])
def tarzbot_new_session(request):
    user_id = request.data.get("user_id")
    if not user_id:
        return Response({"success": False, "error": "user_id required"}, status=400)
    session_id = str(uuid.uuid4())
    return Response({"success": True, "session_id": session_id})

@api_view(["POST", "DELETE"])
def tarzbot_delete_session(request):
    """
    Delete a session and all its messages from the database
    """
    if request.method == "DELETE":
        session_id = request.data.get("session_id")
        user_id = request.data.get("user_id")
    else:
        session_id = request.data.get("session_id")
        user_id = request.data.get("user_id")
    
    if not session_id or not user_id:
        return Response({
            "success": False, 
            "error": "session_id and user_id required"
        }, status=400)
    
    try:
        # Delete all messages for this session and user
        deleted_count = TarzChatMessage.objects(
            user_id=user_id, 
            session_id=session_id
        ).delete()
        
        return Response({
            "success": True,
            "message": f"Session deleted successfully. {deleted_count} messages removed.",
            "deleted_count": deleted_count
        })
        
    except Exception as e:
        return Response({
            "success": False,
            "error": f"Error deleting session: {str(e)}"
        }, status=500)

@api_view(["POST"])
def tarzbot_generate_title(request):
    """
    Generate a title for a chat session based on conversation content
    """
    conversation = request.data.get("conversation")
    prompt = request.data.get("prompt")
    
    if not conversation:
        return Response({
            "success": False,
            "error": "conversation content required"
        }, status=400)
    
    try:
        # Use the existing Gemini function to generate title
        title = get_gemini_response(prompt or f"Generate a short title (max 50 chars) for this conversation: {conversation}")
        
        # Clean up the title (remove quotes, extra spaces, etc.)
        title = title.strip().strip('"').strip("'")
        if len(title) > 50:
            title = title[:47] + "..."
        
        return Response({
            "success": True,
            "title": title
        })
        
    except Exception as e:
        return Response({
            "success": False,
            "error": f"Error generating title: {str(e)}"
        }, status=500)

@api_view(["PUT", "POST"])
def tarzbot_update_session_title(request):
    """
    Update the title of a session by modifying the first message content
    """
    session_id = request.data.get("session_id")
    title = request.data.get("title")
    
    if not session_id or not title:
        return Response({
            "success": False,
            "error": "session_id and title required"
        }, status=400)
    
    try:
        # Find the first message in the session and update its content to be the title
        first_message = TarzChatMessage.objects(session_id=session_id).order_by("timestamp").first()
        
        if first_message:
            # Update the first message content to be the title
            first_message.content = title
            first_message.save()
            
            return Response({
                "success": True,
                "message": "Session title updated successfully"
            })
        else:
            return Response({
                "success": False,
                "error": "No messages found for this session"
            }, status=404)
            
    except Exception as e:
        return Response({
            "success": False,
            "error": f"Error updating session title: {str(e)}"
        }, status=500)
