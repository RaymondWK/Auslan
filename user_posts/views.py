'''
user_posts/views.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

from django.shortcuts import render
import json
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.core.paginator import Paginator
from django.contrib.auth import get_user_model
from django.db.models import Subquery
from django.views.decorators.http import require_http_methods

User = get_user_model()

# Create your views here.

from .models import UserPost, Like, Follow, Mute, Block

def index(request):
    return render(request, "user_posts/index.html")

@csrf_protect
@login_required
def create(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON for text 'data'."}, status=400)

    text = data.get("text", "").strip()

    if not text:
        return JsonResponse({"error": "Text must not be empty."}, status=400)

    user_post = UserPost(
        user=request.user,
        text=text
    )

    user_post.save()

    return JsonResponse({"message": "Post was successful."}, status=201)

def get_posts(request, chosenPosts):
    def serialize_with_likes(post, current_user=None):
        # Add number of likes of posts and number liked by the user to
        # the serialized fields for the current user: see models.py
        base = post.serialize(current_user)

        base.update({
            "likes_count": post.likes.count(),
            "liked_by_user": (
                post.likes.filter(user=current_user).exists()
                if getattr(current_user, "is_authenticated", False)
                else False
            ),
        })

        return base

    # Filter posts returned based on which menu has been chosen
    if chosenPosts == "new":
        if request.user.is_authenticated:
            # Mutes and blocks
            muted_user_ids = Mute.objects.filter(muting_user=request.user).values_list('muted_user_id', flat=True)

            blocked_users    = Block.objects.filter(blocker=request.user).values_list('blocked', flat=True)
            blocked_by_users = Block.objects.filter(blocked=request.user).values_list('blocker', flat=True)

            # Build base queryset: all posts since last login (if any)
            queryset = UserPost.objects.all()  # Does not evaluate until rendered; builds the query

            if request.user.previous_login:
                queryset = queryset.filter(timestamp__gt=request.user.previous_login)

            # Apply exclusions
            posts = (
                queryset
                .exclude(user_id__in=Subquery(muted_user_ids))
                .exclude(user_id__in=Subquery(blocked_users))
                .exclude(user_id__in=Subquery(blocked_by_users))
                .order_by('-timestamp')
            )
        else:
            return render(request, "users/register.html")

    elif chosenPosts == "all-posts":
        if request.user.is_authenticated:
            blocked_users    = Block.objects.filter(blocker=request.user).values_list('blocked', flat=True)
            blocked_by_users = Block.objects.filter(blocked=request.user).values_list('blocker', flat=True)

            posts = UserPost.objects.exclude(user__in=blocked_users)    \
                                    .exclude(user__in=blocked_by_users) \
                                    .order_by('-timestamp')
        else:
            posts = UserPost.objects.all().order_by('-timestamp')

    elif chosenPosts == "timeline": # The user's posts
        if request.user.is_authenticated:
            posts = UserPost.objects.filter(user_id=request.user.id).order_by('-timestamp')
        else:
            return render(request, "users/register.html")

    elif chosenPosts == "following":
        if request.user.is_authenticated:
            users = request.user.following_set.values_list('following', flat=True)
            posts = UserPost.objects.filter(user_id__in=list(users)).order_by('-timestamp')
        else:
            return render(request, "users/register.html")
    else:
        return JsonResponse({"error": "Invalid chosen menu."}, status=400)

    # Return posts in reverse chronologial order
    posts = posts.order_by("-timestamp").all()

    page_number = request.GET.get("page", 1)

    paginator = Paginator(posts, 10)  # 10 posts per page
    page_obj  = paginator.get_page(page_number)

    if paginator.count == 0:
        data = {
            "is_authenticated": request.user.is_authenticated,
            "posts"       : [],
            "page"        : None,
            "total_pages" : 0,
            "has_next"    : False,
            "has_previous": False
        }
    else:
        data = {
            "is_authenticated": request.user.is_authenticated,
            "posts"       : [serialize_with_likes(post, request.user if request.user.is_authenticated else None)
                             for post in page_obj],
            "page"        : page_obj.number,
            "total_pages" : paginator.num_pages,
            "has_next"    : page_obj.has_next(),
            "has_previous": page_obj.has_previous(),
        }

    return JsonResponse(data)

@csrf_protect
@login_required
def like(request, post_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT required"}, status=400)

    try:
        post = UserPost.objects.get(pk=post_id)
    except UserPost.DoesNotExist:
        return JsonResponse({"error": "Post not found"}, status=404)

    # Prevent self-liking
    if request.user == post.user:
        return JsonResponse({"error": "You cannot 'like' your own post."}, status=403)

    data = json.loads(request.body)

    like_status = data.get("like", False)

    if like_status:  # like
        Like.objects.get_or_create(user=request.user, post=post)
    else:  # unlike
        Like.objects.filter(user=request.user, post=post).delete()

    # Compute updated info
    likes_count   = post.likes.count()  # uses related_name="likes" on Like
    liked_by_user = Like.objects.filter(user=request.user, post=post).exists()

    return JsonResponse({
        "success"      : True,
        "likes_count"  : likes_count,
        "liked_by_user": liked_by_user
    })

@csrf_protect
@login_required
def follow(request, user_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT required"}, status=400)

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    # Prevent self-following
    if request.user == user:
        return JsonResponse({"error": "You cannot 'follow' yourself."}, status=403)

    data = json.loads(request.body)

    follow_status = data.get("to_follow", False) # whether to 'follow' or 'unfollow'

    if follow_status:  # follow
        Follow.objects.get_or_create(follower=request.user, following=user)
    else:  # unfollow
        Follow.objects.filter(follower=request.user, following=user).delete()

    # Compute updated info
    followed = Follow.objects.filter(follower=request.user, following=user).exists()

    return JsonResponse({
        "success"  : True,
        "followed" : followed
    })

@login_required
def get_follow_counts(request):
    current_user = request.user

    # Get counts
    count_following = current_user.following_set.count()
    count_followers = current_user.followers_set.count()

    return JsonResponse({
        "following" : count_following,
        "followers" : count_followers
    })

@csrf_protect
@login_required
def post_edit(request, post_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT required"}, status=400)

    try:
        post = UserPost.objects.get(pk=post_id)
    except UserPost.DoesNotExist:
        return JsonResponse({"error": "Post not found"}, status=404)

    # Only allow editing if it's the user's own post
    if request.user != post.user:
       return JsonResponse({"error": "Not allowed"}, status=403)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    new_text = data.get("text", "").strip()
    if not new_text:
        return JsonResponse({"error": "Text cannot be empty"}, status=400)

    post.text = new_text
    post.save(update_fields=['text'])

    return JsonResponse({
        "success": True,
    })

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

    target_user = get_object_or_404(User, id=user_id)
    follower    = request.user

    if to_mute:  # mute
        Mute.objects.get_or_create(muting_user=request.user, muted_user=user)

        # Remove 'follow' in one direction
        Follow.objects.filter(follower=follower, following=target_user).delete()
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
    muted_users = (
        Mute.objects
        .filter(muting_user=request.user)
        .select_related('muted_user')
        .order_by('muted_user__username')
    )

    data = [
        {
            'user_id' : muted_user.muted_user.id,
            'username': muted_user.muted_user.username,
            'muted_at': muted_user.muted_at.strftime('%Y-%m-%d %H:%M %p'), # ("%b %d %Y, %I:%M %p")
        }
        for muted_user in muted_users
    ]

    return JsonResponse({'muted_users': data})

@csrf_protect
@require_http_methods(["PUT"])
@login_required
def block(request, user_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT required"}, status=400)

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    # Prevent self-ignoring
    if request.user == user:
        return JsonResponse({"error": "You cannot 'block' yourself."}, status=403)

    data = json.loads(request.body)

    to_block = data.get("to_block", False)

    target_user = get_object_or_404(User, id=user_id)
    blocker     = request.user

    if to_block:
        Block.objects.get_or_create(blocker=blocker, blocked=target_user)

        # Remove 'follow' in both directions
        Follow.objects.filter(follower=blocker, following=target_user).delete()
        Follow.objects.filter(follower=target_user, following=blocker).delete()
    else:
        Block.objects.filter(blocker=blocker, blocked=target_user).delete()

    # Compute updated info
    to_block = Block.objects.filter(blocker=blocker, blocked=target_user).exists()

    return JsonResponse({
        "success"   : True,
        "to_block" : to_block
    })

@login_required
def get_blocked_users(request):
    blocked_users = (
        Block.objects
        .filter(blocker=request.user)
        .select_related('blocked')
        .order_by('blocked__username')
    )

    data = [
        {
            'user_id'   : blocked_user.blocked.id,
            'username'  : blocked_user.blocked.username,
            'blocked_at': blocked_user.blocked_at.strftime('%Y-%m-%d %H:%M %p'), # ("%b %d %Y, %I:%M %p")
        }
        for blocked_user in blocked_users
    ]

    return JsonResponse({'blocked_users': data})
