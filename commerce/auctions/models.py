from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    watchlist = models.ManyToManyField('Listing', blank=True, related_name="watchlisted_by")

class Listing(models.Model):
    # realized i needed to write all of these defaults="" while migrating
    title = models.CharField(max_length=100, default="Untiteled")
    description = models.TextField(default="No description yet")
    bid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tag_category = models.CharField(max_length=50, default="Uncategorized")
    picture = models.FileField(upload_to='listing_images/', blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="listing", null=True, blank=True)
    # making sure the auctions are active
    is_active = models.BooleanField(default=True)
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True,null=True, related_name="win_listing")

    def __str__(self):
        return self.title

class Bid(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bids", null=True, blank=True)
    listing =models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="bids")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} bid {self.amount} on {self.listing.title}"


class comments(models.Model):
    pass 
