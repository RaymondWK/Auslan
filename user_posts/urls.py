'''
user_posts/urls.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

from django.urls import path

from . import views

app_name = "user_posts"

urlpatterns = [
    # API Routes
    path(""                            , views.index            , name="index"),
    path("create/"                     , views.create           , name="create"),
    path("get_posts/<str:chosenPosts>/", views.get_posts        , name="get_posts"),
    path("like/<int:post_id>/"         , views.like             , name="like"),
    path("follow/<int:user_id>/"       , views.follow           , name="follow"),
    path("get_follow_counts/"          , views.get_follow_counts, name="get_follow_counts"),
    path("post_edit/<int:post_id>/"    , views.post_edit        , name="post_edit"),
    path("mute/<int:user_id>/"         , views.mute             , name="mute"),
    path("get_muted_users/"            , views.get_muted_users  , name="get_muted_users"), # for the current user
    path("block/<int:user_id>/"        , views.block            , name="block"),
    path("get_blocked_users/"          , views.get_blocked_users, name="get_blocked_users"), # for the current user
]
