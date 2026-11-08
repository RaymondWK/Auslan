'''
populate_user_data.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

import os
import django

# Point to the Django project's settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auslan.settings")

from django.contrib.auth import get_user_model

# Initialise Django
django.setup()

import random
from random import randint, sample

from user_posts   .models import UserPost, Like as UserPostLike, Follow as UserPostFollow, Mute as UserPostMute, Block as UserPostBlock
from user_messages.models import UserMessage, Mute as UserMessageMute

User = get_user_model()

# Seed the random number generator based on the current year
# Also gives the same result every time (unless the seed is changed)
random.seed(2025)

def create_users():
    users = []

    for ch in "ABCDEF":
        user = User.objects.create_user(
            username    = ch,
            password    = ch.lower(),
            first_name  = ch * 2,
            last_name   = ch.lower() * 2,
            email       = f"{ch.lower()}@{ch.lower()}.com",
            is_verified = True
        )

        users.append(user)

    return users

def create_posts(users):
    UserPost.objects.all().delete()

    for user in users:
        for i in range(25):
            UserPost.objects.create(
                user = user,
                text = f"Hello from {user.username}"
            )

def create_messages(users):
    UserMessage.objects.all().delete()

    for sender in users:
        others = list(users)   # include self → allows self-messaging

        for i in range(25):
            # choose 1–3 recipients, may include sender
            k = randint(1, min(3, len(others)))
            recipients = sample(others, k)

            subject = f"Message {i + 1}"
            body = f"Hello from {sender.username}"

            # sender + all recipients get a copy
            message_users = set(recipients)
            message_users.add(sender)

            for user in message_users:
                msg = UserMessage.objects.create(
                        user     = user,
                        sender   = sender,
                        subject  = subject,
                        body     = body,
                        read     = user == sender or randint(0,1),
                        archived = randint(0, 5) == 0,
                )

                msg.recipients.add(*recipients)

def create_post_likes(users):
    UserPostLike.objects.all().delete()

    for user in users:
        for other in users:
            if other == user:
                continue

            posts = list(UserPost.objects.filter(user=other))
            if not posts:
                continue;

            random.shuffle(posts)

            # Like N posts from each other user
            N = randint(0, min(20, len(posts)))

            for post in posts[:N]:
                UserPostLike.objects.create(
                    user = user,
                    post = post
                )

def create_post_follows(users):
    UserPostFollow.objects.all().delete()

    for user in users:
        others = [u for u in users if u != user]
        random.shuffle(others)

        # user is to follow N others
        N = randint(0, min(6, len(others)))

        for other in others[:N]:
            UserPostFollow.objects.create(
                follower  = user,
                following = other
            )

def create_post_mutes(users):
    UserPostMute.objects.all().delete()

    for user in users:
        others = [u for u in users if u != user]
        random.shuffle(others)

        # user is to mute N others
        N = randint(0, min(6, len(others)))

        for other in others[:N]:
            UserPostMute.objects.create(
                muting_user = user,
                muted_user  = other
            )

def create_post_blocks(users):
    UserPostBlock.objects.all().delete()

    for user in users:
        others = [u for u in users if u != user]
        random.shuffle(others)

        # user blocks at least 1 and at most 6 others
        N = randint(1, min(6, len(others)))

        for other in others[:N]:
            UserPostBlock.objects.create(
                blocker = user,
                blocked = other
            )

def create_message_mutes(users):
    UserMessageMute.objects.all().delete()

    for user in users:
        others = [u for u in users if u != user]
        random.shuffle(others)

        # user is to mute N others
        N = randint(2, min(7, len(others)))

        for other in others[:N]:
            UserMessageMute.objects.create(
                muting_user = user,
                muted_user  = other
            )

def empty_join_tables():
    UserPostLike  .objects.all().delete()
    UserPostFollow.objects.all().delete()
    UserPostMute  .objects.all().delete()
    UserPostBlock .objects.all().delete()

    UserMessageMute.objects.all().delete()

    UserPost   .objects.all().delete()
    UserMessage.objects.all().delete()

def delete_unwanted_users(): # leave the superuser
    User.objects.filter(is_superuser=False).delete();

def populate_user_data():
    users = create_users()

    create_posts   (users)
    create_messages(users)

    create_post_likes  (users)
    create_post_follows(users)
    create_post_mutes  (users)
    create_post_blocks (users)

    create_message_mutes(users)

empty_join_tables()
delete_unwanted_users()

populate_user_data()
