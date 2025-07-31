from django.db import models
from mongoengine import Document, StringField, DateTimeField, BooleanField
from django.utils import timezone

# Create your models here.

class TarzChatMessage(Document):
    user_id = StringField(required=True)
    sender = StringField(required=True)
    receiver = StringField(required=True)
    content = StringField(required=True)
    timestamp = DateTimeField(default=timezone.now)
    from_ai = BooleanField(default=False)
    session_id = StringField(required=True)

    meta = {
        'collection': 'tarz_chat_messages',
        'ordering': ['timestamp'],
        'strict': False,
    }
