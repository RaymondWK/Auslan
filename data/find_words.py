# find_words.py

# For a subword, find and display all its parent blockwords

file_path_3 = 'used_words_3.txt'
file_path_4 = 'used_words_4.txt'
file_path_5 = 'used_words_5.txt'
file_path_9 = 'used_words_9.txt'

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

def letter_counts(word: str) -> dict:
    """Return a dictionary of letter counts in the given alphabetic word."""
    counts = {}

    for ch in word.lower():          # lower() to count case-insensitively
        counts[ch] = counts.get(ch, 0) + 1

    return counts

def is_A_le_B(counts_A, counts_B):
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

words_3 = get_words(file_path_3)
words_4 = get_words(file_path_4)
words_5 = get_words(file_path_5)
words_9 = get_words(file_path_9)

def display_words_containing(word):
    print()
    print(word)

    counts_word = letter_counts(word)

    for word_9 in words_9:
        counts_9 = letter_counts(word_9)

        if not is_A_le_B(counts_word, counts_9):
            continue

        print(word_9)

display_words_containing("rants")
display_words_containing("swine")
