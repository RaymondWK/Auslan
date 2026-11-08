'''
user_messages/models.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

from django.db import models
from django.conf import settings

class UserMessage(models.Model):
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="messages")
    sender     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="messages_sent")
    recipients = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="messages_received")
    subject    = models.CharField(max_length=255)
    body       = models.TextField(blank=True)
    timestamp  = models.DateTimeField(auto_now_add=True)
    read       = models.BooleanField(default=False)
    archived   = models.BooleanField(default=False)

    def serialize(self):
        return {
            "id"        : self.id,
            "sender_id" : self.sender.id,
            "sender"    : self.sender.username,
            "recipients": [user.username for user in self.recipients.all()],
            "subject"   : self.subject,
            "body"      : self.body,
            "timestamp" : self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "read"      : self.read,
            "archived"  : self.archived,
        }

class Mute(models.Model):
    muting_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='messages_muting_set') # users who this User has muted
    muted_user  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='messages_muted_set')  # users who are muting this User
    muted_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensures that a user can only mute another user once
        unique_together = ('muting_user', 'muted_user')

    def __str__(self):
        return f"{self.muting_user.username} muted {self.muted_user.username} at {self.muted_at.strftime("%b %d %Y, %I:%M %p")}"
