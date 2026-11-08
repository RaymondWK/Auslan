'''
users/models.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower

class User(AbstractUser):
    email          = models.EmailField(unique=True)
    is_verified    = models.BooleanField(default=False)
    previous_login = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            UniqueConstraint(Lower("username"), name="unique_lower_username"),
            UniqueConstraint(Lower("email")   , name="unique_lower_email"),
        ]
