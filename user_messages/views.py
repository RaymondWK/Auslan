'''
user_messages/views.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

import json
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import HttpResponse, render, redirect
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils.http import urlencode
from django.views.decorators.csrf import csrf_protect
from django.db.models import Subquery

from .models import UserMessage, Mute

User = get_user_model()

def index(request):
    # Authenticated users view their inbox
    if request.user.is_authenticated:
        return render(request, "user_messages/inbox.html")
    else: # Everyone else is prompted to sign in
        login_url = reverse("users:login")
        params    = urlencode({"next": request.path})

        return redirect(f"{login_url}?{params}")

@csrf_protect
@login_required
def send(request):
    # Sending a new message must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Check recipient messages
    data = json.loads(request.body)

    recipient_usernames = [username.strip() for username in data.get("recipients").split(",")]

    if recipient_usernames == [""]:
        return JsonResponse({
            "error": "At least one recipient required."
        }, status=400)

    # Convert usernames to users
    recipients = []
    for recipient_username in recipient_usernames:
        try:
            user = User.objects.get(username__iexact=recipient_username)
            recipients.append(user)
        except User.DoesNotExist:
            return JsonResponse({
                "error": f"User with username {recipient_username} does not exist."
            }, status=400)

    # Get contents of message
    subject = data.get("subject", "")
    body    = data.get("body", "")

    # Create one message for each recipient, plus sender
    users = set()
    users.add(request.user)
    users.update(recipients)

    for user in users:
        user_message = UserMessage(
            user    = user,
            sender  = request.user,
            subject = subject,
            body    = body,
            read    = user == request.user
        )

        user_message.save()

        for recipient in recipients:
            user_message.recipients.add(recipient)

    return JsonResponse({"message": "Message sent successfully."}, status=201)


@login_required
def get_messages(request, messagebox):
    # Get start point
    start = int(request.GET.get("start") or 0)
    limit = 10

    # Filter messages returned based on messagebox
    if messagebox == "new":
        # IDs of users muted by the current user
        muted_user_ids = Mute.objects.filter(muting_user=request.user).values_list('muted_user_id', flat=True)

        # Base queryset
        queryset = UserMessage.objects.filter(
            user       = request.user,
            recipients = request.user,
            archived   = False,
            read       = False
        )

        # Only filter to recent messages if user has logged in before
        if request.user.previous_login:
            queryset = queryset.filter(timestamp__gt=request.user.previous_login)

        # Apply exclusions and sort and set the start and end points
        messages = (
            queryset
            .exclude(sender_id__in=Subquery(muted_user_ids))
            .order_by("-timestamp")[start:start + limit]
        )
    elif messagebox == "inbox":
        messages = UserMessage.objects.filter(
            user=request.user, recipients=request.user, archived=False
        ).order_by("-timestamp")[start:start + limit]
    elif messagebox == "sent":
        messages = UserMessage.objects.filter(
            user=request.user, sender=request.user
        ).order_by("-timestamp")[start:start + limit]
    elif messagebox == "archived":
        messages = UserMessage.objects.filter(
            user=request.user, archived=True
        ).order_by("-timestamp")[start:start + limit]
    else:
        return JsonResponse({"error": "Invalid messagebox."}, status=400)

    return JsonResponse({
        "messages": [m.serialize() for m in messages],
        "count"   : messages.count()
    })

@csrf_protect
@login_required
def get_message(request, message_id):

    # Query for requested message
    try:
        message = UserMessage.objects.get(user=request.user, pk=message_id)
    except UserMessage.DoesNotExist:
        return JsonResponse({"error": "Message not found."}, status=404)

    # Return message contents
    if request.method == "GET":
        # Determine if the sender is muted by the current user
        is_muted = Mute.objects.filter(
                       muting_user = request.user,
                       muted_user  = message.sender
                   ).exists()

        data             = message.serialize()
        data["is_muted"] = is_muted

        return JsonResponse(data)

    # Update whether message is read or should be archived
    elif request.method == "PUT":
        data = json.loads(request.body)

        if data.get("read") is not None:
            message.read = data["read"]
            message.save()

        elif data.get("archived") is not None:
            message.archived = data["archived"]
            message.save()

        if data.get("delete") is not None:
            message.delete()

        return HttpResponse(status=204)

    # Message must be via GET or PUT
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)

@csrf_protect
@login_required
def mute(request, user_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT required"}, status=400)

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    # Prevent self-muting
    if request.user == user:
        return JsonResponse({"error": "You cannot 'mute' yourself."}, status=403)

    data = json.loads(request.body)

    to_mute = data.get("to_mute", False)

    if to_mute:  # mute
        Mute.objects.get_or_create(muting_user=request.user, muted_user=user)
    else:  # unmute
        Mute.objects.filter(muting_user=request.user, muted_user=user).delete()

    # Compute updated info
    muted = Mute.objects.filter(muting_user=request.user, muted_user=user).exists()

    return JsonResponse({
        "success" : True,
        "muted"   : muted
    })

@login_required
def get_muted_users(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not logged in."}, status=403)

    muted_users = (
        Mute.objects
        .filter(muting_user=request.user)
        .select_related('muted_user')
        .order_by('muted_user__username')
    )

    data = [
        {
            'id'      : muted_user.muted_user.id,
            'username': muted_user.muted_user.username,
            'muted_at': muted_user.muted_at.strftime('%Y-%m-%d %H:%M %p'), # ("%b %d %Y, %I:%M %p")
        }
        for muted_user in muted_users
    ]

    return JsonResponse({'muted_users': data})
