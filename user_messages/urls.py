'''
user_messages/urls.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

from django.urls import path

from . import views

app_name = "user_messages"

urlpatterns = [
    path(""                               , views.index          , name="index"),
    path("send/"                          , views.send           , name="send"),
    path("get_message/<int:message_id>/"  , views.get_message    , name="get_message"),
    path("get_messages/<str:messagebox>/" , views.get_messages   , name="get_messages"),
    path("mute/<int:user_id>/"            , views.mute           , name="mute"),
    path("get_muted_users/"               , views.get_muted_users, name="get_muted_users"),
]
