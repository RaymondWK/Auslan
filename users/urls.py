'''
users/urls.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

from django.urls import path
from users.admin import auslan_admin_site

from . import views

app_name = "users"

urlpatterns = [
    path('admin/'    , auslan_admin_site.urls),

    path("login/"    , views.login_view  , name="login"),
    path("logout/"   , views.logout_view , name="logout"),
    path("register/" , views.register    , name="register"),
    path("verify/"   , views.verify      , name="verify"),
 ]
