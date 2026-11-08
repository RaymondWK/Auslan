'''
fs/urls.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

from django.urls import path

from . import views

app_name = "fs"

urlpatterns = [
    path(""                   , views.intro               , name="intro"),
    path("letters/"           , views.letters             , name="letters"),
    path("recognition/"       , views.recognition         , name="recognition"),
    path("memory/"            , views.memory              , name="memory"),
    path("memory/new/"        , views.memory_new          , name="memory_new"),
    path("save_memory_result/", views.save_memory_result  , name="save_memory_result"),
    path("blockwords/"        , views.blockwords          , name="blockwords"),
    path("blockword/random/"  , views.get_random_blockword, name="get_random_blockword"),
    path("reader/"            , views.reader              , name="reader"),
]

