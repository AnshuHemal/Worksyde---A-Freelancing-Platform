from mongoengine import Document, StringField, ListField, DateTimeField
from datetime import datetime

class ChatRoom(Document):
    id = StringField(primary_key=True)  # Allow string-based room IDs
    meta = {'db_alias': 'default', 'collection': 'chat_room'}
    name = StringField(max_length=255)
    participants = ListField(StringField())  # store user IDs as strings
    created_at = DateTimeField(default=datetime.utcnow)

class Message(Document):
    meta = {'db_alias': 'default', 'collection': 'chat_message'}
    room_id = StringField(required=True)  # store room id as string
    sender_id = StringField(required=True)
    receiver_id = StringField(required=True)
    content = StringField()
    timestamp = DateTimeField(default=datetime.utcnow)
    system = StringField(default=None)
    status = StringField(default="sent")  # sent, delivered, read
    # Attachment fields
    attachment_url = StringField()
    attachment_type = StringField()
    attachment_name = StringField()
