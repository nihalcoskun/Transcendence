from django.db import models

# Create your models here.
class Stats(models.Model):
    players = models.JSONField()
    winning_player = models.CharField()
    isTournamet = models.BooleanField()
    user = models.CharField()