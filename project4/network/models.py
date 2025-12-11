from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    Likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)

    def __str__(self):
        return f"{self.user.username}: {self.content[:30]}"


#class Profile(models.Model):
#    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
 #   following = models.ManyToManyField("self", symmetrical=False, related_name="followers", blank=True)
    
  #  def __str__(self):
   #     return f"profile({self.user.username})"


class Likes():
    pass
