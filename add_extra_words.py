'''
add_extra_words.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

import os
import django
from django.db import transaction

# Point to the Django project's settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auslan.settings")

# Initialise Django
django.setup()

from fs.models import BlockWord, Word3, Word4, Word5, SubWord3, SubWord4, SubWord5

def add_words(blockword, word_list):
    """
    Add words from word_list as subwords for the given 9-letter blockword.
    word_list should be an iterable of strings (e.g. ["scorn","sitar","trios"])
    """
    try:
        block_obj = BlockWord.objects.get(blockword=blockword)
    except BlockWord.DoesNotExist:
        raise ValueError(f"BlockWord '{blockword}' not found")

    # mapping: length -> (WordModel, SubWordModel)
    mapping = {
        3: (Word3, SubWord3),
        4: (Word4, SubWord4),
        5: (Word5, SubWord5),
    }

    added   = [] # list of tuples (len, word) that were added
    skipped = [] # list of tuples (len, word, reason)

    # Use a transaction so either all succeed or none (optional)
    with transaction.atomic():
        for raw in word_list:
            if not isinstance(raw, str):
                skipped.append((None, raw, "not-a-string"))
                continue

            word = raw.strip().lower()
            L    = len(word)

            if L not in mapping:
                skipped.append((L, word, "invalid-length"))
                continue

            WordModel, SubModel = mapping[L]

            # Ensure the WordN row exists (create if missing)
            word_obj, created_word = WordModel.objects.get_or_create(word=word)

            # Create the SubWord row only if it doesn't already exist
            subkw = {"blockword": block_obj, "subword": word_obj}
            sub_obj, created_sub = SubModel.objects.get_or_create(**subkw)

            if created_sub:
                added.append((L, word))
            else:
                skipped.append((L, word, "already-exists"))

    return {
        "added"  : added,
        "skipped": skipped
        }

def add_some_new_words_1():
    blockword = "crayonist"
    words     = ["scorn", "sitar", "trios"]

    result = add_words(blockword, words)

    print("Added  :", result["added"])
    print("Skipped:", result["skipped"])

def add_some_new_words_2():
    words_9 = [
        "diameters",
        "dreamiest",
        "emigrated",
        "jamborees",
        "jeremiads",
        "megahertz",
        "moderates",
        "sermonize",
        "smartweed",
        "stampeder",
        "temporize",
        "timeshare"
    ]

    for blockword in words_9:
        words = ["mere"]

        result = add_words(blockword, words)

        print()
        print(blockword + ":")
        print("  Added  :", result["added"])
        print("  Skipped:", result["skipped"])

def add_some_new_words_3():
    words = ["rants"]
    blockwords = [
        "absorbent",
        "adsorbent",
        "aerations",
        "aeronauts",
        "ancestors",
        "anointers",
        "antiserum",
        "argentous",
        "arguments",
        "assertion",
        "assurgent",
        "attorneys",
        "baritones",
        "brainstem",
        "brawniest",
        "bystander",
        "clarinets",
        "courtesan",
        "crankiest",
        "crayonist",
        "creations",
        "disnature",
        "draftsmen",
        "durations",
        "earnestly",
        "emigrants",
        "eyestrain",
        "fractions",
        "frontages",
        "gradients",
        "gyrations",
        "indurates",
        "integrals",
        "intervals",
        "larcenist",
        "mastering",
        "merchants",
        "miscreant",
        "monastery",
        "narcotism",
        "narrowest",
        "northeast",
        "notarizes",
        "observant",
        "obtainers",
        "ordinates",
        "outreason",
        "oysterman",
        "pasturing",
        "patroness",
        "peasantry",
        "personate",
        "quatrains",
        "rainspout",
        "reactions",
        "recasting",
        "relations",
        "renovates",
        "reobtains",
        "reseating",
        "resinated",
        "resonated",
        "romantics",
        "ruminates",
        "sanitizer",
        "sedentary",
        "senoritas",
        "serration",
        "signatory",
        "signature",
        "sparteine",
        "spearmint",
        "sportsman",
        "stationer",
        "stauncher",
        "stoneware",
        "strangely",
        "strangled",
        "streaking",
        "streaming",
        "subaltern",
        "sunbather",
        "supinator",
        "tardiness",
        "tarnished",
        "terminals",
        "terrapins",
        "tornadoes",
        "transpire",
        "transpose",
        "triangles",
        "tribesman",
        "tribunals",
        "truancies",
        "turbofans",
        "tyrannies",
        "underacts",
        "unwariest",
        "urbanites",
        "vestryman",
        "wristband"
    ]

    print(words)

    for blockword in blockwords:
        result = add_words(blockword, words)

        print(f"  {blockword}")

        print("    Added  :", result["added"])
        print("    Skipped:", result["skipped"])

    words     = ["swine"]
    blockwords = [
        "brawniest",
        "downtimes",
        "ownership",
        "shipowner",
        "snowfield",
        "unwariest",
        "womanizes",
    ]

    print()
    print(words)

    for blockword in blockwords:
        result = add_words(blockword, words)

        print(f"  {blockword}")

        print("    Added  :", result["added"])
        print("    Skipped:", result["skipped"])

def add_some_new_words_4():
    words = ["reads"]
    blockwords = [
        "absconder",
        "adjusters",
        "adsorbate",
        "adsorbent",
        "adversity",
        "aspirated",
        "asteroids",
        "astrodome",
        "broadness",
        "bystander",
        "colanders",
        "costarred",
        "credenzas",
        "dangerous",
        "daughters",
        "decorates",
        "deflators",
        "democrats",
        "depasture",
        "derogates",
        "desirably",
        "desolater",
        "deviators",
        "diameters",
        "dishwater",
        "disnature",
        "disparate",
        "dispersal",
        "displacer",
        "displayer",
        "draftsmen",
        "dreamiest",
        "drumbeats",
        "educators",
        "forehands",
        "garnished",
        "gasholder",
        "gradients",
        "grandiose",
        "guardsmen",
        "handsomer",
        "headfirst",
        "homewards",
        "idolaters",
        "indurates",
        "jeremiads",
        "keyboards",
        "leftwards",
        "mediators",
        "moderates",
        "nursemaid",
        "ordinates",
        "outspread",
        "pardoners",
        "pederasty",
        "plastered",
        "ponderosa",
        "practised",
        "predators",
        "prolapsed",
        "purchased",
        "rapidness",
        "readjusts",
        "redisplay",
        "resinated",
        "resonated",
        "sandpiper",
        "satirized",
        "secondary",
        "sedentary",
        "shoreward",
        "sidetrack",
        "smartweed",
        "solarized",
        "spadework",
        "spermatid",
        "spikenard",
        "spiralled",
        "spreading",
        "squanders",
        "stampeder",
        "stargazed",
        "steelyard",
        "steroidal",
        "strangled",
        "tardiness",
        "tarnished",
        "teardrops",
        "timecards",
        "tornadoes",
        "trackside",
        "tradeoffs",
        "tragedies",
        "underacts",
        "underpays",
        "ungrasped",
        "unloaders",
        "unpraised",
        "unsprayed",
        "unsquared",
        "wanderoos",
        "wardrobes",
        "waterbeds",
        "watershed",
        "waterside"
    ]

    print(words)

    for blockword in blockwords:
        result = add_words(blockword, words)

        print(f"  {blockword}")

        print("    Added  :", result["added"])
        print("    Skipped:", result["skipped"])

#add_some_new_words_1()
#add_some_new_words_2()
#add_some_new_words_3()
add_some_new_words_4()
