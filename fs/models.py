# -*- coding: utf-8 -*-

'''
fs/models.py
Copyright © 2025 Dr. Raymond William Kennington Ph.D.
'''

from django.db import models
from django.conf import settings

class MemoryHighScore(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="memory_scores"
    )

    nPairs   = models.PositiveSmallIntegerField()
    nColumns = models.PositiveSmallIntegerField()

    game_mode         = models.CharField(max_length=1) # 'S' or 'C'
    computer_strength = models.CharField(max_length=1, default='U') # U/B/I/A/E

    timing_mode   = models.CharField(max_length=1) # 'U', 'L', 'R'
    time_per_move = models.PositiveSmallIntegerField() # 1–60

    position = models.CharField(max_length=1) # '1' or '2'; i.e. User (Player) goes 1st or 2nd

    max_score    = models.PositiveSmallIntegerField(default=0) # 0..26
    max_accuracy = models.PositiveSmallIntegerField(default=0)
    min_duration = models.DurationField(null=True, blank=True)
    min_moves    = models.PositiveSmallIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (
            "user", "nPairs", "nColumns",
            "game_mode", "computer_strength",
            "timing_mode", "time_per_move", "position"
        )

    def __str__(self):
        return f"{self.user} Memory Score ({self.nPairs} pairs)"

class BlockWord(models.Model):
    blockword = models.CharField(max_length=9, unique=True)

    def __str__(self):
        return self.blockword

class Word3(models.Model):
    word = models.CharField(max_length=3, unique=True)

    def __str__(self):
        return self.word

class Word4(models.Model):
    word = models.CharField(max_length=4, unique=True)

    def __str__(self):
        return self.word

class Word5(models.Model):
    word = models.CharField(max_length=5, unique=True)

    def __str__(self):
        return self.word

class Word6(models.Model):
    word = models.CharField(max_length=6, unique=True)

    def __str__(self):
        return self.word

class SubWord3(models.Model):
    blockword = models.ForeignKey(
        BlockWord,
        on_delete=models.CASCADE,
        related_name="sub3"
    )

    subword = models.ForeignKey(Word3, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.blockword.blockword} → {self.subword}"

class SubWord4(models.Model):
    blockword = models.ForeignKey(
        BlockWord,
        on_delete=models.CASCADE,
        related_name="sub4"
    )

    subword = models.ForeignKey(Word4, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.blockword.blockword} → {self.subword}"

class SubWord5(models.Model):
    blockword = models.ForeignKey(
        BlockWord,
        on_delete=models.CASCADE,
        related_name="sub5"
    )

    subword = models.ForeignKey(Word5, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.blockword.blockword} → {self.subword}"

class SubWord6(models.Model):
    blockword = models.ForeignKey(
        BlockWord,
        on_delete=models.CASCADE,
        related_name="sub6"
    )

    subword = models.ForeignKey(Word6, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.blockword.blockword} → {self.subword}"
