'''
user_messages/admin.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

from .models import UserMessage
from django.contrib import admin
from users.admin import auslan_admin_site  # import the custom admin site

class UserMessageAdmin(admin.ModelAdmin):
    list_display  = ('id', 'user', 'sender', 'display_recipients', 'subject', 'body', 'read', 'archived', 'timestamp')  # show all important fields
    search_fields = ('subject', 'body', 'user__username', 'sender__username')
    list_filter   = ('read', 'archived', 'timestamp')

    def display_recipients(self, obj):
        # Join all recipient usernames with commas
        return ", ".join([r.username for r in obj.recipients.all()])

    display_recipients.short_description = 'Recipients'

# Register with custom admin site
auslan_admin_site.register(UserMessage, UserMessageAdmin)
