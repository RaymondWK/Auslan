"""
URL configuration for auslan project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from users.admin import auslan_admin_site  # custom AdminSite
from django.urls import include, path
from . import views

# These URL patterns are copyright
# by Dr. Raymond Kennington
# Copyright © 2025 Dr. Raymond William Kennington Ph.D.

urlpatterns = [
    path('admin/', auslan_admin_site.urls),

    # Project-wide pages
    path(""               , views.home         , name="home"),  # main site index page
    path("help/"          , views.help_page    , name="help"),
    path("about/"         , views.about_page   , name="about"),
    path("release_notes/" , views.release_notes, name="release_notes"),

    # App routes
    path("fs/"           , include(("fs.urls"           , "fs"           ), namespace="fs")),
    path("user_messages/", include(("user_messages.urls", "user_messages"), namespace="user_messages")),
    path("user_posts/"   , include(("user_posts.urls"   , "user_posts"   ), namespace="user_posts")),
    path("users/"        , include(("users.urls"        , "users"        ), namespace="users")),
]
