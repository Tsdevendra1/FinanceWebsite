from django.db import models

# Create your models here.
from django.db.models.signals import post_save
from django.dispatch import receiver
from django_common.auth_backends import User


class SentimentScore(models.Model):
    """
    Keeps track of the sentiment scores for a ticker
    """
    # The ticker for which the sentiment score is saved
    ticker = models.TextField()
    # The sentiment score
    sentiment_score = models.PositiveIntegerField()
    # The week for which the sentiment score was calculated
    week = models.TextField()


class Ticker(models.Model):
    company = models.TextField()
    ticker_symbol = models.TextField()

    def __str__(self):
        return self.company


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    tickers = models.ManyToManyField(Ticker, null=True, blank=True)


@receiver(post_save, sender=User)
def update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    instance.profile.save()
