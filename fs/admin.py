from django.contrib import admin
from users.admin import auslan_admin_site  # import the custom admin site

from .models import (
    MemoryHighScore,
    BlockWord,
    Word3, Word4, Word5,
    SubWord3, SubWord4, SubWord5,
)

auslan_admin_site.register(MemoryHighScore)
auslan_admin_site.register(BlockWord)
auslan_admin_site.register(Word3)
auslan_admin_site.register(Word4)
auslan_admin_site.register(Word5)
auslan_admin_site.register(SubWord3)
auslan_admin_site.register(SubWord4)
auslan_admin_site.register(SubWord5)
