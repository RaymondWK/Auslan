# user_posts/models.py
# Copyright © 2025 Dr. Raymond William Kennington Ph.D.

from django.db import models
from django.conf import settings

class UserPost(models.Model):
    user      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="posts")
    text      = models.TextField(blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)


    def serialize(self, current_user=None):
        is_authenticated = getattr(current_user, "is_authenticated", False)

        return {
            "id"       : self.id,
            "user_id"  : self.user.id,
            "user"     : self.user.username,
            "text"     : self.text,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),

            "liked_by_user": (
                self.likes.filter(user=current_user).exists()
                if is_authenticated else False
            ),
            "posted_by_user": (
                self.user_id == current_user.id
                if is_authenticated else False
            ),
            "is_following": (
                Follow.objects.filter(follower=current_user, following=self.user).exists()
                if is_authenticated else False
            ),
            "is_muted": (
                Mute.objects.filter(muting_user=current_user, muted_user=self.user).exists()
                if is_authenticated else False
            ),
            "is_blocked": (
                Block.objects.filter(blocker=current_user, blocked=self.user).exists()
                if is_authenticated else False
            ),
        }

    def __str__(self):
        return f"{self.id} {self.user.username} {self.timestamp.strftime("%b %d %Y, %I:%M %p")}"


class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey(UserPost, on_delete=models.CASCADE, related_name="likes")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'post'], name='unique_like_user_post')
        ]

    def __str__(self):
        return f"{self.user.username} liked UserPost {self.post.id}"


class Follow(models.Model):
    follower  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='following_set') # users who this User is following
    following = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='followers_set') # users who are following this User

    class Meta:
        # Ensures that a user can only follow another user once
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"

class Mute(models.Model):
    muting_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='muting_set') # users who this User has muted
    muted_user  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='muted_set')  # users who are muting this User
    muted_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensures that a user can only mute another user once
        unique_together = ('muting_user', 'muted_user')

    def __str__(self):
        return f"{self.muting_user.username} has muted {self.muted_user.username} at {self.muted_at.strftime("%b %d %Y, %I:%M %p")}"

class Block(models.Model):
    blocker    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blocking")
    blocked    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blocked_by")
    blocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('blocker', 'blocked')

    def __str__(self):
        return f"{self.blocker.username} has blocked {self.blocked.username} at {self.blocked_at.strftime("%b %d %Y, %I:%M %p")}"
