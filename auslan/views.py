# auslan/views.py
# by Dr. Raymond Kennington
# Copyright © 2025 Dr. Raymond William Kennington Ph.D.

from django.shortcuts import render

def home(request):
    return render(request, "base/index.html")

def help_page(request):
    return render(request, "base/help.html")

def about_page(request):
    return render(request, "base/about.html")

def release_notes(request):
    return render(request, "base/release_notes.html")
