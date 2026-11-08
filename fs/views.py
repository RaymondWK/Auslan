'''
fs/views.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

from django.shortcuts import render
from django.http import JsonResponse
import random
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required
from datetime import timedelta

import base64

from .models import MemoryHighScore
from .models import BlockWord

def intro(request):
    return render(request, "fs/intro.html")

def get_letters():
    # Default: one frame per letter
    letters = {chr(c): [""] for c in range(ord("A"), ord("Z") + 1)}

    # Special cases
    letters["H"] = [f"{i}" for i in range(5)]  # th_H0.jpg, th_H1.jpg, th_H2.jpg, th_H3.jpg, th_H4.jpg
    letters["J"] = [f"{i}" for i in range(3)]  # th_J0.jpg, th_J3.jpg, th_J4.jpg

    return letters

def get_subset_of_letters(subset_of_alphabet):
    # Default: one frame per letter
    letters = {c: [""] for c in subset_of_alphabet}

    # Special cases

    if "H" in letters:
        letters["H"] = [f"{i}" for i in range(5)]  # th_H0.jpg, th_H1.jpg, th_H2.jpg, th_H3.jpg, th_H4.jpg

    if "H" in letters:
        letters["J"] = [f"{i}" for i in range(3)]  # th_J0.jpg, th_J3.jpg, th_J4.jpg

    return letters

def letters(request):
    letters = get_letters()

    return render(request, "fs/letters.html", {"letters": letters})

def recognition(request):
    """
    User is to practice recognition of the fingerspelled letters.
    There are many variations:
    Ranomised/Untimed/Without repetitions/With letter images/With highlighted images

        Ordered
            Untimed
                Without repetitions
                    With FS letter images
    1                   With retained highlighted letters
    2                   Without retained highlighted letters
                    With alphabetic letters
    3                   With retained highlighted letters
    4                   Without retained highlighted letters
                With repetitions
                    With FS letter images
    5                   With retained highlighted letters
    6                   Without retained highlighted letters
                    With alphabetic letters
    7                   With retained highlighted letters
    8                   Without retained highlighted letters
            Timed
                Without repetitions
                    With FS letter images
    9                   With retained highlighted letters
    10                  Without retained highlighted letters
                    With alphabetic letters
    11                  With retained highlighted letters
    12                  Without retained highlighted letters
                With repetitions
                    With FS letter images
    13                  With retained highlighted letters
    14                  Without retained highlighted letters
                    With alphabetic letters
    15                  With retained highlighted letters
    16                  Without retained highlighted letters

        Randomised
            Untimed
                Without repetitions
                    With FS letter images
    17                  With retained highlighted letters
    18                  Without retained highlighted letters
                    With alphabetic letters
    19                  With retained highlighted letters
    20                  Without retained highlighted letters
                With repetitions
                    With FS letter images
    21                  With retained highlighted letters
    22                  Without retained highlighted letters
                    With alphabetic letters
    23                  With retained highlighted letters
    24                  Without retained highlighted letters
            Timed
                Without repetitions
                    With FS letter images
    25                  With retained highlighted letters
    26                  Without retained highlighted letters
                    With alphabetic letters
    27                  With retained highlighted letters
    28                  Without retained highlighted letters
                With repetitions
                    With FS letter images
    29                  With retained highlighted letters
    30                  Without retained highlighted letters
                    With alphabetic letters
    31                  With retained highlighted letters
    32                  Without retained highlighted letters

    """
    letters = get_letters()

    return render(request, "fs/recognition.html", {"letters": letters})

def memory(request):
    """Render the initial memory game page."""
    return render(request, "fs/memory.html")

ALPHABET = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

def memory_new(request):
    """
    Returns a shuffled array of card objects for the memory game.
    Query parameters:
      pairs: number of pairs (2-26)
    """
    try:
        n_pairs = int(request.GET.get("pairs", 4))
    except ValueError:
        n_pairs = 4

    n_pairs = max(2, min(26, n_pairs))  # clamp to 2-26

    letters = get_letters()

    chosen = random.sample(list(letters.keys()), n_pairs)

    cards = []

    for letter in chosen:
        frames = letters[letter]

        # Add two independent card objects to the list of cards
        cards.append({"letter": letter, "frames": frames})
        cards.append({"letter": letter, "frames": frames})

    random.shuffle(cards)

    return JsonResponse({
        "cards" : cards
    })

@csrf_protect
@login_required
def save_memory_result(request):
    if request.method != 'POST':
        return JsonResponse({"error": "invalid_method"}, status=405)

    data = request.POST

    computer_strength = data.get("computer_strength")

    # Parse parameters: these define the unique record
    params = dict(
        user              = request.user,
        nPairs            = int(data["nPairs"]),
        nColumns          = int(data["nColumns"]),
        game_mode         = data["game_mode"],
        computer_strength = computer_strength,
        timing_mode       = data["timing_mode"],
        time_per_move     = int(data["time_per_move"]),
        position          = data["position"]
    )

    latest_moves    = int(data["moves"])
    latest_score    = int(data["score"])
    latest_accuracy = int(data["accuracy"])

    durationMS      = int(data["gameDurationMS"])
    duration_td     = timedelta(milliseconds=durationMS)

    record, created = MemoryHighScore.objects.get_or_create(**params)

    improved_moves    = False
    improved_score    = False
    improved_accuracy = False
    improved_time     = False
    to_save           = False

    if computer_strength == 'U': # Solitaire
        if created:
            record.min_moves    = latest_moves
            record.max_score    = 0
            record.max_accuracy = latest_accuracy
            record.min_duration = duration_td
            to_save = True

            improved_moves    = True
            improved_score    = False
            improved_accuracy = True
            improved_time     = True
        else:
            record.max_score = 0

            if     record.min_moves is None \
                or record.min_moves == 0 \
                or latest_moves < record.min_moves:

                record.min_moves = latest_moves
                to_save = True

                improved_moves = True

            if     record.min_duration is None     \
                or duration_td < record.min_duration:

                record.min_duration = duration_td
                to_save = True

                improved_time = True

            if latest_accuracy > record.max_accuracy: # Accuracy improved
                record.max_accuracy = latest_accuracy
                to_save = True

                improved_accuracy = True
    else: # computer_strength is one of B/I/A/E:
        if created:
            record.min_moves    = None
            record.max_score    = latest_score
            record.max_accuracy = latest_accuracy
            record.min_duration = None
            to_save = True

            improved_moves    = False
            improved_score    = True
            improved_accuracy = True
            improved_time     = False
        else:
            if latest_score > record.max_score: # Score improved

                record.max_score = latest_score
                to_save          = True

                improved_score = True

            else: # Did not beat or equal the previous best score
                pass

            if latest_accuracy > record.max_accuracy: # Accuracy improved
                record.max_accuracy = latest_accuracy
                to_save             = True

                improved_accuracy = True

    if to_save:
        record.save()

    if record.min_duration is not None:
        min_duration_ms = int(record.min_duration.total_seconds() * 1000)
    else:
        min_duration_ms = None

    return JsonResponse({
        "created"              : created,
        "improved_score"       : improved_score,
        "improved_moves"       : improved_moves,
        "improved_accuracy"    : improved_accuracy,
        "improved_time"        : improved_time,
        "current_max_score"    : record.max_score,
        "current_min_moves"    : record.min_moves,
        "current_max_accuracy" : record.max_accuracy,
        "current_min_time"     : min_duration_ms,
    })


SECRET = 131  # any number 0–255

def encode_word(word):
    xored = bytes([ord(c) ^ SECRET for c in word])

    return base64.b64encode(xored).decode("utf-8")

def blockwords(request):
    """Render the initial BlockWords game page."""
    return render(request, "fs/blockwords.html")

@csrf_exempt
def get_random_blockword(request):
    # Pick a random BlockWord
    ids   = BlockWord.objects.values_list("id", flat=True)
    bw_id = random.choice(list(ids))
    bw    = BlockWord.objects.get(id=bw_id)

    list3 = list(bw.sub3.values_list("subword__word", flat=True))
    list4 = list(bw.sub4.values_list("subword__word", flat=True))
    list5 = list(bw.sub5.values_list("subword__word", flat=True))

    encrypted_blockword = encode_word(bw.blockword)

    encrypted_list3 = [encode_word(word) for word in list3]
    encrypted_list4 = [encode_word(word) for word in list4]
    encrypted_list5 = [encode_word(word) for word in list5]

    data = {
        "blockword": encrypted_blockword,
        "subwords": {
            "3": encrypted_list3,
            "4": encrypted_list4,
            "5": encrypted_list5,
        }
    }

    return JsonResponse(data)

def reader(request):
    return render(request, 'fs/reader.html')
