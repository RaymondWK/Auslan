'''
users/views.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.cache import never_cache
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.http import url_has_allowed_host_and_scheme
import random

User = get_user_model()

@never_cache
@ensure_csrf_cookie
def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user     = authenticate(request, username=username, password=password)

        if user is not None:
            # user found — check if verified
            if not user.is_verified:
                return render(request, "users/login.html", {
                    "message": "Please verify your email before logging in."
                })

            if user.last_login:
                user.previous_login     = user.last_login
                user.save(update_fields = ["previous_login"])

            login(request, user)

            next_url = request.POST.get('next', '/')

            # Validate to prevent open redirect attacks (handle open redirect prevention)
            if not url_has_allowed_host_and_scheme(next_url, allowed_hosts={request.get_host()}):
                next_url = "/"

            return redirect(next_url)

        # invalid credentials
        return render(request, "users/login.html", {"message": "Invalid username and/or password."})
    else:
        return render(request, "users/login.html")

@never_cache
@ensure_csrf_cookie    # make sure cookie gets sent on this response
@login_required
def logout_view(request):
    next_page = request.GET.get("next", "/")
    logout(request)

    # Render an intermediate page so the csrf cookie is applied
    return render(request, "users/post_logout.html", {"next": next_page})

@never_cache
@csrf_protect
def register(request):
    if request.method == "POST":
        username   = request.POST["username"]
        first_name = request.POST["first-name"]
        last_name  = request.POST["last-name"]
        email      = request.POST["email"]

        if User.objects.filter(username__iexact=username).exists():
            # username already exists
            return render(request, "users/register.html", {
                "message": "Please use a different username."
            })

        if User.objects.filter(email__iexact=email).exists():
            # email already exists
            return render(request, "users/register.html", {
                "message": "Please choose a different email address."
            })

        # Ensure password matches confirmation
        password     = request.POST["password"]
        confirmation = request.POST["confirmation"]

        if password != confirmation:
            return render(request, "users/register.html", {
                "message": "Passwords must match."
            })

        # Create unverified user
        try:
            user = User.objects.create_user(username, email, password, first_name=first_name, last_name=last_name, is_verified=False)
            user.save()
        except IntegrityError:
            return render(request, "users/register.html", {
                "message": "Unknown integrity error."
            })

        # Generate and hash a 6-digit code
        code = f"{random.randint(100000, 999999)}"

        request.session["verify_code_hash"]  = make_password(code)
        request.session["verify_user_id"]    = user.id
        request.session["verify_expires_at"] = timezone.now().timestamp() + 600  # 600 s = 10 min

       # Send the code to the email provided
        send_mail(
            subject        = "Your verification code",
            message        = f"Your verification code is: {code}\n\nThis code expires in 10 minutes.",
            from_email     = "noreply@nowhere.com",
            recipient_list = [email],
        )

        return redirect("users:verify")

    else: # request.method != "POST"
        return render(request, "users/register.html")

@never_cache
@csrf_protect
def verify(request):
    if request.method == "POST":
        code_entered = request.POST["code"]
        code_hash    = request.session.get("verify_code_hash")
        user_id      = request.session.get("verify_user_id")
        expires_at   = request.session.get("verify_expires_at")

        # Check expiry first
        if not expires_at or timezone.now().timestamp() > expires_at:
            # Clear the session values
            for key in ("verify_code_hash", "verify_user_id", "verify_expires_at"):
                request.session.pop(key, None)

            return render(request, "users/verify.html", {"message": "Verification code expired. Please register again."})

        # Check correctness
        if code_hash and check_password(code_entered, code_hash):
            user             = User.objects.get(id=user_id)
            user.is_verified = True
            user.save()

            # Clear the session values
            for key in ("verify_code_hash", "verify_user_id", "verify_expires_at"):
                request.session.pop(key, None)

            # Successful verfication
            return redirect("users:login")

        # Error: Invalid code
        return render(request, "users/verify.html", {"message": "Invalid code. Please try again."})

    # Not "POST"
    return render(request, "users/verify.html")
