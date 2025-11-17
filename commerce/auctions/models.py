from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Listing(models.Model):
    title = models.CharField(max_length=100, default="Untiteled")
    description = models.TextField(default="No description yet")
    bid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tag_category = models.CharField(max_length=50, default="Uncategorized")
    picture = models.FileField(upload_to='listing_images/', blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="listings", null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class bids(models.Model):
    pass 

class comments(models.Model):
    pass 
