'''
populate_blockwords.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

''' Read in the words and save to the database.

1. Read in the 9-letter words that are to be used in the BlockWords app.
2. Read in the 3-, 4- and 5-letter words that are subwords of at least one blockword.
3. Add each blockword to the database, and then add the subwords for each blockword.
4. There are some tests after saving.
'''
import os
import django

import random

# Point to the Django project's settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auslan.settings")

# Initialise Django
django.setup()

from fs.models import BlockWord, Word3, Word4, Word5, Word6, SubWord3, SubWord4, SubWord5, SubWord6

file_path_3 = 'data/used_words_3.txt'
file_path_4 = 'data/used_words_4.txt'
file_path_5 = 'data/used_words_5.txt'
file_path_6 = 'data/used_words_6.txt'
file_path_9 = 'data/used_words_9.txt'

words_3 = []
words_4 = []
words_5 = []
words_6 = []
words_9 = []

def get_words(file_path):
    try:
        with open(file_path, 'r') as file:
            lines = file.readlines()

        for i in range(len(lines)):
            lines[i] = lines[i].strip()

        lines.sort()

        return lines
    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")

def read_in_the_words():
    global words_3, words_4, words_5, words_6, words_9

    words_3 = get_words(file_path_3)
    words_4 = get_words(file_path_4)
    words_5 = get_words(file_path_5)
    words_6 = get_words(file_path_6)
    words_9 = get_words(file_path_9)

def save_words_3(words):
    for word in words:
        record = Word3.objects.create(word=word)

def save_words_4(words):
    for word in words:
        record = Word4.objects.create(word=word)

def save_words_5(words):
    for word in words:
        record = Word5.objects.create(word=word)

def save_words_6(words):
    for word in words:
        record = Word6.objects.create(word=word)

def save_words_9(words):
    for word in words:
        record = BlockWord.objects.create(blockword=word)

def display_saved_words3():
    words = Word3.objects.all()

    for word in words:
        print(word)

def display_saved_words4():
    words = Word4.objects.all()

    for word in words:
        print(word)

def display_saved_words5():
    words = Word5.objects.all()

    for word in words:
        print(word)

def display_saved_words6():
    words = Word6.objects.all()

    for word in words:
        print(word)

def display_saved_words_9():
    words = BlockWord.objects.all()

    for word in words:
        print(word)

def letter_counts(word: str) -> dict:
    """Return a dictionary of letter counts in the given alphabetic word."""
    counts = {}

    for ch in word.lower():          # lower() to count case-insensitively
        counts[ch] = counts.get(ch, 0) + 1

    return counts

def is_A_le_B(counts_A, counts_B): # Counts_A[letter] <= counts_B[letter] for all letters
    """
    Determines if all keys in dict counts_A exist in dict counts_B, and if so,
    if counts_A.value <= counts_B.value for those keys.

    Args:
        counts_A (dict): The first dictionary of letter counts.
        counts_B (dict): The second dictionary of letter counts.

    Returns:
        bool: True if all keys in counts_A meet the conditions, False otherwise.
    """
    for key, value_A in counts_A.items():
        # Check if the key from counts_A exists in counts_B
        if key not in counts_B:
            return False

        # Check if the value in counts_A is less than or equal to the value in counts_B
        value_B = counts_B[key]

        if value_A > value_B:  # Equivalent to checking if not (value_A <= value_B)
            return False

    # If the loop finishes without returning False, all conditions were met
    return True

def display_subwords(word_9):
    print()
    print(word_9)

    counts_9 = letter_counts(word_9)

    print()
    for (word_3) in words_3:
        word_count_for_3 = letter_counts(word_3)

        if is_A_le_B(word_count_for_3, counts_9):
            print("    " + word_3)

    print()
    for (word_4) in words_4:
        word_count_for_4 = letter_counts(word_4)

        if is_A_le_B(word_count_for_4, counts_9):
            print("    " + word_4)

    print()
    for (word_5) in words_5:
        word_count_for_5 = letter_counts(word_5)

        if is_A_le_B(word_count_for_5, counts_9):
            print("    " + word_5)

    print()
    for (word_6) in words_6:
        word_count_for_6 = letter_counts(word_6)

        if is_A_le_B(word_count_for_6, counts_9):
            print("    " + word_6)

def save_all_subwords(): # This is optimised: it uses bulk saving
    # Preload all subwords into fast lookup dictionaries
    words3 = {w.word: w for w in Word3.objects.all()}
    words4 = {w.word: w for w in Word4.objects.all()}
    words5 = {w.word: w for w in Word5.objects.all()}
    words6 = {w.word: w for w in Word6.objects.all()}

    # Preload all blockwords
    blockwords = {bw.blockword: bw for bw in BlockWord.objects.all()}

    # Convert word lists of strings into Python sets for speed
    words_3_set = set(words3.keys())
    words_4_set = set(words4.keys())
    words_5_set = set(words5.keys())
    words_6_set = set(words6.keys())

    # Determine the letter-counts for 3-, 4-, 5- and 6-letter words (just once)
    counts_3 = {w: letter_counts(w) for w in words_3_set}
    counts_4 = {w: letter_counts(w) for w in words_4_set}
    counts_5 = {w: letter_counts(w) for w in words_5_set}
    counts_6 = {w: letter_counts(w) for w in words_6_set}

    # Prepare empty lists for bulk_create
    sub3_to_create = []
    sub4_to_create = []
    sub5_to_create = []
    sub6_to_create = []

    # Process each blockword
    for word_9, blockword_object in blockwords.items():
        counts_9 = letter_counts(word_9)

        # process 3-letter words
        for w in words_3_set:
            if is_A_le_B(counts_3[w], counts_9):
                sub3_to_create.append(
                    SubWord3(blockword=blockword_object, subword=words3[w])
                )

        # process 4-letter words
        for w in words_4_set:
            if is_A_le_B(counts_4[w], counts_9):
                sub4_to_create.append(
                    SubWord4(blockword=blockword_object, subword=words4[w])
                )

        # process 5-letter words
        for w in words_5_set:
            if is_A_le_B(counts_5[w], counts_9):
                sub5_to_create.append(
                    SubWord5(blockword=blockword_object, subword=words5[w])
                )

        # process 6-letter words
        for w in words_6_set:
            if is_A_le_B(counts_6[w], counts_9):
                sub6_to_create.append(
                    SubWord6(blockword=blockword_object, subword=words6[w])
                )

    # Bulk insert the records
    SubWord3.objects.bulk_create(sub3_to_create, batch_size=2000)
    SubWord4.objects.bulk_create(sub4_to_create, batch_size=2000)
    SubWord5.objects.bulk_create(sub5_to_create, batch_size=2000)
    SubWord6.objects.bulk_create(sub6_to_create, batch_size=2000)

def display_saved_subwords(word_9):
    print(word_9)

    blockword = BlockWord.objects.get(blockword=word_9)

    words = SubWord3.objects.filter(blockword=blockword).order_by('subword').values_list('subword__word', flat=True)

    for word in words:
        print("    " + word)

    words = SubWord4.objects.filter(blockword=blockword).order_by('subword').values_list('subword__word', flat=True)

    for word in words:
        print("    " + word)

    words = SubWord5.objects.filter(blockword=blockword).order_by('subword').values_list('subword__word', flat=True)

    for word in words:
        print("    " + word)

    words = SubWord6.objects.filter(blockword=blockword).order_by('subword').values_list('subword__word', flat=True)

    for word in words:
        print("    " + word)

def populate_fs():
    SubWord3.objects.all().delete()
    SubWord4.objects.all().delete()
    SubWord5.objects.all().delete()
    SubWord6.objects.all().delete()

    Word3.objects.all().delete()
    Word4.objects.all().delete()
    Word5.objects.all().delete()
    Word6.objects.all().delete()

    BlockWord.objects.all().delete()

    save_words_3(words_3)
    save_words_4(words_4)
    save_words_5(words_5)
    save_words_6(words_6)
    save_words_9(words_9)

    save_all_subwords()

def display_words_containing(word):
    counts_word = letter_counts(word)

    for word_9 in words_9:
        counts_9 = letter_counts(word_9)

        if not is_A_le_B(counts_word, counts_9):
            continue

        print(word_9)

def display_counts_of_saved_words():
    count_blockwords = BlockWord.objects.count()

    count_words_3    = Word3.objects.count()
    count_words_4    = Word4.objects.count()
    count_words_5    = Word5.objects.count()
    count_words_6    = Word5.objects.count()

    count_subwords_3 = SubWord3.objects.count()
    count_subwords_4 = SubWord4.objects.count()
    count_subwords_5 = SubWord5.objects.count()
    count_subwords_6 = SubWord5.objects.count()

    print(f"blockwords : {count_blockwords:5}")

    print(f"words 3    : {count_words_3:5}")
    print(f"words 4    : {count_words_4:5}")
    print(f"words 5    : {count_words_5:5}")
    print(f"words 6    : {count_words_6:5}")

    print(f"subwords 3 : {count_subwords_3:5}")
    print(f"subwords 4 : {count_subwords_4:5}")
    print(f"subwords 5 : {count_subwords_5:5}")
    print(f"subwords 6 : {count_subwords_6:5}")

def check_counts_of_saved_words():
    known_count_blockwords =   820

    known_count_words_3    =   501
    known_count_words_4    =  1827
    known_count_words_5    =  2633
    known_count_words_6    =  3297

    known_count_subwords_3 = 33865
    known_count_subwords_4 = 63351
    known_count_subwords_5 = 43259
    known_count_subwords_6 = 23555

    count_blockwords = BlockWord.objects.count()

    count_words_3    = Word3.objects.count()
    count_words_4    = Word4.objects.count()
    count_words_5    = Word5.objects.count()
    count_words_6    = Word5.objects.count()

    count_subwords_3 = SubWord3.objects.count()
    count_subwords_4 = SubWord4.objects.count()
    count_subwords_5 = SubWord5.objects.count()
    count_subwords_6 = SubWord5.objects.count()

    print()

    if (    (count_blockwords == known_count_blockwords)
        and (count_words_3    == known_count_words_3)
        and (count_words_4    == known_count_words_4)
        and (count_words_5    == known_count_words_5)
        and (count_words_6    == known_count_words_6)
        and (count_subwords_3 == known_count_subwords_3)
        and (count_subwords_4 == known_count_subwords_4)
        and (count_subwords_5 == known_count_subwords_5)
        and (count_subwords_6 == known_count_subwords_6)
    ):
        print("**********************************")
        print("Counts of saved words are correct.")
        print("**********************************")
    else:
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("Sorry, but failed to save the words in the database.")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

'''
display_saved_words3()
display_saved_words4()
display_saved_words5()
display_saved_words_9()

display_subwords("alchemist")
display_saved_subwords("alchemist")

display_words_containing("rants")
display_words_containing("swine")
'''
# display_counts_of_saved_words()

read_in_the_words()
populate_fs()

check_counts_of_saved_words()
