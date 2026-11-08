'''
users/admin.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

from django.contrib import admin
from .models import User
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from django.contrib.auth.models import Group
from django.contrib.auth.admin import GroupAdmin

from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache

class auslanAdminSite(admin.AdminSite):
    site_header = "Auslan Admin"
    site_title  = "Auslan Admin Portal"
    index_title = "Welcome to Auslan Admin"

    @method_decorator(never_cache)
    def index(self, request, extra_context=None):
        return super().index(request, extra_context)

    @method_decorator(never_cache)
    def login(self, request, extra_context=None):
        return super().login(request, extra_context)

    @method_decorator(never_cache)
    def logout(self, request, extra_context=None):
        response = super().logout(request, extra_context)
        # optional redirect after logout:
        from django.shortcuts import redirect
        return redirect('fs:index')

# instantiate your custom admin site

auslan_admin_site = auslanAdminSite(name='auslanAdmin')

# Register your models here.

class UserAdmin(DjangoUserAdmin):
    model = User
    list_display = DjangoUserAdmin.list_display + ('is_verified', 'is_superuser')
    list_editable = ('is_verified', 'is_staff', 'is_superuser')

    # 'fieldsets': sections and fields in the form displayed when click on a user to edit them
    fieldsets = DjangoUserAdmin.fieldsets + (
        ('Verification', {'fields': ('is_verified',)}),
    )

    search_fields = ("username", "email")

auslan_admin_site.register(User, UserAdmin)

auslan_admin_site.register(Group, GroupAdmin)
