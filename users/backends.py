'''
users/backends.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

UserModel = get_user_model()

# Django uses this when using 'authenticate' with case-insensitive logins:
# user = authenticate(request, username=u, password=p)

class CaseInsensitiveUsernameBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None
        try:
            # Compare lowercase username
            user = UserModel.objects.get(username__iexact=username)
        except UserModel.DoesNotExist:
            return None
        else:
            if user.check_password(password) and self.user_can_authenticate(user):
                return user

        return None
