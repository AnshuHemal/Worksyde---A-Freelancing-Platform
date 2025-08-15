from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status
from mongoengine import connect
from .models import ChatRoom, Message
from django.utils import timezone
from bson import ObjectId
from datetime import datetime
import pytz
from rest_framework.parsers import MultiPartParser
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import base64
from .text_validation import validate_text


def send_system_message(client_id, freelancer_id, job_title, client_name):
    participants = sorted([str(client_id), str(freelancer_id)])
    room_id = "_".join(participants)

    # Ensure chat room exists
    room = ChatRoom.objects(id=room_id).first()
    if not room:
        room = ChatRoom(id=room_id, name=room_id, participants=participants)
        room.save()

    # Compose message
    content = f"Congrats!! Your Proposal is accepted by the {client_name} for the jobpost {job_title}."

    # Insert message as from client to freelancer
    Message(
        room_id=room_id,
        sender_id=str(client_id),
        receiver_id=str(freelancer_id),
        content=content,
        system="true",
    ).save()


@api_view(["POST"])
@parser_classes([MultiPartParser])
def chat_file_upload(request):
    file = request.FILES.get("file")
    if not file:
        return Response({"success": False, "message": "No file uploaded"}, status=400)
    # Read raw bytes and encode as base64 data URI to store in DB directly
    raw_bytes = file.read()
    mime_type = file.content_type or "application/octet-stream"
    b64_data = base64.b64encode(raw_bytes).decode("utf-8")
    data_uri = f"data:{mime_type};base64,{b64_data}"

    file_type = "image" if mime_type.startswith("image/") else "file"

    return Response(
        {
            "success": True,
            "url": data_uri,  # store this string in DB via chat message
            "type": file_type,
            "name": file.name,
        }
    )


@api_view(["POST", "GET"])
def chat_view(request):
    if request.method == "POST":
        data = request.data
        sender_id = data.get("sender")
        receiver_id = data.get("receiver")
        content = data.get("message")
        attachment = data.get("attachment")
        if not sender_id or not receiver_id or (not content and not attachment):
            return Response(
                {
                    "success": False,
                    "message": "Missing sender, receiver, or message/attachment",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if content:
            is_valid = validate_text(content)
            if not is_valid:
                return Response(
                    {
                        "success": False,
                        "message": "Chat regulations violated. Message not saved.",
                    },
                    status=status.HTTP_200_OK,
                )
        elif not attachment:
            # no content, no attachment
            return Response(
                {"success": False, "message": "Empty message. Nothing to send."},
                status=status.HTTP_200_OK,
            )
        participants = sorted([str(sender_id), str(receiver_id)])
        room_id = "_".join(participants)
        room = ChatRoom.objects(id=room_id).first()
        if not room:
            room = ChatRoom(id=room_id, name=room_id, participants=participants)
            room.save()
        ist = pytz.timezone("Asia/Kolkata")
        now_ist = datetime.now(ist)
        msg_kwargs = dict(
            room_id=room_id,
            sender_id=sender_id,
            receiver_id=receiver_id,
            content=content,
            timestamp=now_ist,
        )
        if attachment:
            msg_kwargs.update(
                attachment_url=attachment.get("url"),
                attachment_type=attachment.get("type"),
                attachment_name=attachment.get("name"),
            )
        Message(**msg_kwargs).save()
        return Response(
            {
                "success": True,
                "message": "Chat room created and message logged",
                "room_id": room_id,
            },
            status=201,
        )
    elif request.method == "GET":
        sender_id = request.query_params.get("sender")
        receiver_id = request.query_params.get("receiver")
        if not sender_id or not receiver_id:
            return Response(
                {"success": False, "message": "Sender and receiver are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        participants = sorted([str(sender_id), str(receiver_id)])
        room_id = "_".join(participants)
        room = ChatRoom.objects(id=room_id).first()
        if not room:
            return Response(
                {"success": False, "message": "Chat room not found"}, status=404
            )
        messages = Message.objects(room_id=room_id).order_by("timestamp")
        messages_data = [
            {
                "_id": str(m.id),
                "room_id": m.room_id,
                "sender_id": m.sender_id,
                "receiver_id": m.receiver_id,
                "content": m.content,
                "timestamp": m.timestamp.isoformat() if m.timestamp else None,
                "system": m.system,
                "attachment": (
                    {
                        "url": m.attachment_url,
                        "type": m.attachment_type,
                        "name": m.attachment_name,
                    }
                    if m.attachment_url
                    else None
                ),
            }
            for m in messages
        ]
        return Response(
            {"success": True, "room_id": room_id, "messages": messages_data}, status=200
        )


@api_view(["POST"])
def hire_notify(request):
    client_id = request.data.get("client_id")
    freelancer_id = request.data.get("freelancer_id")
    job_title = request.data.get("job_title")
    client_name = request.data.get("client_name")

    if not all([client_id, freelancer_id, job_title, client_name]):
        return Response({"success": False, "message": "Missing data"}, status=400)

    send_system_message(client_id, freelancer_id, job_title, client_name)
    return Response({"success": True, "message": "Notification sent"})


@api_view(["GET"])
def chat_rooms_view(request):
    user_id = request.query_params.get("user_id")
    if not user_id:
        return Response(
            {"success": False, "message": "user_id is required"}, status=400
        )
    rooms = ChatRoom.objects(participants=user_id)
    room_list = []
    for room in rooms:
        # Get the other participant
        others = [uid for uid in room.participants if uid != user_id]
        last_msg = Message.objects(room_id=room.name).order_by("-timestamp").first()
        room_list.append(
            {
                "room_id": room.name,
                "participants": room.participants,
                "other_user_id": others[0] if others else None,
                "last_message": (
                    {
                        "_id": str(last_msg.id) if last_msg else None,
                        "content": last_msg.content if last_msg else None,
                        "timestamp": (
                            last_msg.timestamp.isoformat()
                            if last_msg and last_msg.timestamp
                            else None
                        ),
                        "sender_id": last_msg.sender_id if last_msg else None,
                        "status": last_msg.status if last_msg else None,
                    }
                    if last_msg
                    else None
                ),
            }
        )
    return Response({"success": True, "rooms": room_list})


@api_view(["POST"])
def mark_messages_read(request):
    """
    Mark all messages in a room as 'read' for a given user (the receiver).
    Expects: {"room_id": ..., "user_id": ...}
    """
    room_id = request.data.get("room_id")
    user_id = request.data.get("user_id")
    if not room_id or not user_id:
        return Response(
            {"success": False, "message": "room_id and user_id required"}, status=400
        )
    # Only mark messages as read where receiver is user and status != 'read'
    updated = Message.objects(
        room_id=room_id, receiver_id=user_id, status__ne="read"
    ).update(set__status="read")
    return Response({"success": True, "updated": updated})
