import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from pymongo import MongoClient
from django.utils import timezone
from bson import ObjectId
from channels.layers import get_channel_layer
from datetime import datetime
import pytz
from .text_validation import validate_text

# Setup your MongoDB client (reuse your connection string)
client = MongoClient(
    "mongodb+srv://whiteturtle1:dvIw4evFuDVOzea3@cluster0.1e4vx.mongodb.net/worksyde?retryWrites=true&w=majority&appName=Cluster0"
)
db = client["worksyde2"]
chat_rooms_col = db["chat_room"]
chat_messages_col = db["chat_message"]


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        # Get room id from URL route (for dynamic rooms)
        self.room_id = self.scope["url_route"]["kwargs"].get("room_id") or self.scope["url_route"]["kwargs"].get("room_name")
        self.room_group_name = f"chat_{self.room_id}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get("message")
        sender_id = data.get("sender_id") or data.get("sender")
        receiver_id = data.get("receiver_id") or data.get("receiver")
        attachment = data.get("attachment")

        if not all([sender_id, receiver_id]) or (not message and not attachment):
            # Optionally handle invalid data here
            return

        # Validate message text if present
        if message is not None:
            is_valid = validate_text(message)
            if not is_valid:
                # Send alert to sender only (not broadcasted)
                await self.send(text_data=json.dumps({
                    "error": "Chat regulations violated. Message not sent."
                }))
                return

        # Save message to MongoDB (run sync code in thread pool)
        inserted_id = await self.save_message(
            room_id=self.room_id,
            sender_id=sender_id,
            receiver_id=receiver_id,
            content=message,
            attachment=attachment,
        )

        # Broadcast message to the room group
        ist = pytz.timezone('Asia/Kolkata')
        now_ist = datetime.now(ist)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "sender_id": sender_id,
                "receiver_id": receiver_id,
                "timestamp": now_ist.isoformat(),
                "_id": str(inserted_id) if inserted_id else None,
                "attachment": attachment,
            },
        )

        # Broadcast notification to the receiver's notification group
        await self.channel_layer.group_send(
            f"notify_{receiver_id}",
            {
                "type": "notify_message",
                "room_id": self.room_id,
                "message": message,
                "timestamp": now_ist.isoformat(),
                "sender_id": sender_id,
                "_id": str(inserted_id) if inserted_id else None,
                "attachment": attachment,
            },
        )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "message": event["message"],
                    "sender_id": event["sender_id"],
                    "receiver_id": event["receiver_id"],
                    "timestamp": event["timestamp"],
                    "_id": event.get("_id"),
                    "attachment": event.get("attachment"),
                }
            )
        )

    @database_sync_to_async
    def save_message(self, room_id, sender_id, receiver_id, content, attachment=None):
        # Ensure chat room exists or create it
        room = chat_rooms_col.find_one({"_id": room_id})
        if not room:
            ist = pytz.timezone('Asia/Kolkata')
            now_ist = datetime.now(ist)
            chat_rooms_col.insert_one(
                {
                    "_id": room_id,
                    "participants": [sender_id, receiver_id],
                    "created_at": now_ist.isoformat(),
                }
            )

        # Insert chat message
        ist = pytz.timezone('Asia/Kolkata')
        now_ist = datetime.now(ist)
        msg_data = {
            "room_id": room_id,
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "content": content,
            "timestamp": now_ist.isoformat(),
        }
        if attachment:
            msg_data["attachment_url"] = attachment.get("url")
            msg_data["attachment_type"] = attachment.get("type")
            msg_data["attachment_name"] = attachment.get("name")
        result = chat_messages_col.insert_one(msg_data)
        return result.inserted_id


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.group_name = f"notify_{self.user_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        # For now, just echo back or ignore
        pass

    async def notify_message(self, event):
        await self.send(text_data=json.dumps(event))
