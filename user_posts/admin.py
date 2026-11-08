'''
user_posts/admin.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

from .models import UserPost
from django.contrib import admin
from users.admin import auslan_admin_site  # import the custom admin site

class UserPostAdmin(admin.ModelAdmin):
    list_display  = ('id', 'user', 'text', 'timestamp') # show these columns
    search_fields = ('text', 'user__username')          # make searchable by text or username
    list_filter   = ('timestamp',)

# Register with custom admin site
auslan_admin_site.register(UserPost, UserPostAdmin)
