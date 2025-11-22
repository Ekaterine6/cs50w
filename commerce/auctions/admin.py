from django.contrib import admin
from .models import Listing, Bid, Comment
# Register your models here.

# a site administrator should be able to view, add, 
# edit, and delete any listings, comments, and bids made on the site.
admin.site.register(Listing)
admin.site.register(Bid)
admin.site.register(Comment)