from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib import messages
from decimal import Decimal

from .models import Listing, User, Bid, Comment

# i wanted to diplay pictures at first wanted to store the files to media folder basically filesystem folders but 
# then my project would be rejected because - "branch should match the file structure of the unzipped distribution code as originally received."
# so i learned from internet that i could use base64.b64encode "Encode the bytes-like object s using Base64 and return the encoded bytes."

import base64



# Active Listings Page - let users view all of the currently active auction listings
def index(request):
    listings = Listing.objects.filter(is_active=True).order_by('-id')

    for listing in listings:
        if listing.picture:
            pic_byt = listing.picture
            if isinstance(pic_byt, str):
                pic_byt = pic_byt.encode()  
            listing.picture_base64 = base64.b64encode(pic_byt).decode()
            listing.picture_content_type_safe = "image/jpeg" 
        else:
            listing.picture_base64 = None
            listing.picture_content_type_safe = None

     
    # sending the winner a congratulations message and making sure they dont receive the same message again
    if request.user.is_authenticated:
        won_auctions = Listing.objects.filter(winner=request.user, is_active=False)
        for auction in won_auctions:
            alr_seen = request.session.get('seen_auctions', [])
            if auction.id not in alr_seen:
                messages.success(request, f"you won this auction - {auction.title}!")
                alr_seen.append(auction.id)
                request.session['seen_auctions'] = alr_seen

    
    return render(request, "auctions/index.html", {
        "listings":listings
    })


# Categories - page that displays a list of all listing categories
def categories(request):
    categories = Listing.objects.values_list('tag_category', flat=True).distinct()

    return render(request, "auctions/categories.html", {
        "categories" : categories
    })


def cat_listings(request, cat_name):
    listings = Listing.objects.filter(tag_category=cat_name, is_active=True)

    return render(request, "auctions/index.html", {
        "listings":listings,
        "cat_name":cat_name
    })


# Bid -  the user should be able to bid on the item
@login_required
def placed_bid(request, listing_id):
    listing = get_object_or_404(Listing, id=listing_id)

    if request.method == "POST":
        bid_amount = request.POST.get("bid_amount")
        # The bid must be at least as large as the starting bid,
        try:
            bid_amount = Decimal(bid_amount)
        except:
            return render(request, "auctions/listing_page.html", {
                "listing" : listing,
                "error": "Enter a valid bid number!"
            })
        
        # must be greater than any other bids that have been placed (if any). 
        highest_bid_yet = listing.bids.order_by('-amount').first()
        min_bid = listing.bid if highest_bid_yet is None else highest_bid_yet.amount

        # If the bid doesn’t meet those criteria, the user should be presented with an error.
        if bid_amount <= min_bid:
            return render(request, "auctions/listing_page.html", {
                "listing": listing,
                "error": f"the bid you placed must be higher than the current bid - {min_bid}"
            })
        
        Bid.objects.create(
            user=request.user, listing=listing, amount=bid_amount)

        return redirect("listing_page", listing_id=listing.id)


# Create Listing - Users should be able to visit a page to create a new listing
def listing(request):
    if request.method == "POST":
        title = request.POST.get("title")
        description = request.POST.get("description")
        bid = request.POST.get("bid")
        tag_category = request.POST.get("tag_category")
        picture = request.FILES.get("picture")
        image = picture.read() if picture else None
        content_type = picture.content_type if picture else None

        # saving the listing info to database
        Listing.objects.create(
            title=title,
            description=description,
            bid=bid,
            tag_category=tag_category,
            picture=image,
            picture_content_type=content_type,
            user=request.user
        )
        return redirect("index")
    return render(request, "auctions/listing.html")


# Listing Page - take users to a page specific to that listing
def listing_page(request, listing_id):
    listing = get_object_or_404(Listing, id=listing_id)
    comms = listing.comments.all().order_by('-created_at')

    if listing.picture:
        pic_byt = listing.picture
        if isinstance(pic_byt, str):
            # converting teh str to bytes because
            pic_byt = pic_byt.encode()  
        listing.picture_base64 = base64.b64encode(pic_byt).decode()
    else:
        listing.picture_base64 = None

    if request.method == "POST":
        if not request.user.is_authenticated:
            return redirect("login")
        
        # comments - add comments to the listing page listing.picture is already a str - that was the message from an error
        com_txt = request.POST.get("com_txt", "").strip()
        if com_txt != "":
            Comment.objects.create(
                user=request.user,
                text=com_txt,
                listing=listing
            )
        return redirect("listing_page", listing_id=listing.id)
    return render(request, "auctions/listing_page.html", {
        "listing": listing,
        "comms": comms
    })


# watchlist - display all of the listings that a user has added to their watchlist
def watchlist(request):
    if request.user.is_authenticated:
        listings = request.user.watchlist.all()
    else: 
        listings = []
    return render(request, "auctions/watchlist.html", {
        'listings' : listings
    })

@login_required
def add_watchlist(request, listing_id):
    listing = Listing.objects.get(id=listing_id)
    user = request.user

    # making sure to not add the item if it's in watchlist already
    if listing not in user.watchlist.all():
        user.watchlist.add(listing)
    return redirect('watchlist')

@login_required
def remove_watchlist(request, listing_id):
    listing = Listing.objects.get(id=listing_id)
    request.user.watchlist.remove(listing)

    return redirect('watchlist')


# the user should have the ability to “close” the auction, only the user that uploaded the auction 
@login_required
def close_auction(request, listing_id):
    listing = get_object_or_404(Listing, id=listing_id)

    if request.user != listing.user:
        return render(request, "auctions/listing_page.html", {
            "listing": listing,
            "error" : f"Don't have the rights to close the auction"
    })

    # which makes the highest bidder the winner of the auction 
    if request.method == "POST":
        highest_bid = listing.bids.order_by('-amount').first()
        if highest_bid:
            listing.winner = highest_bid.user

        # makes the listing no longer active 
        listing.is_active = False
        listing.save()
        return redirect("listing_page", listing_id=listing.id)
    return redirect("listing_page", listing_id=listing.id)



def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")
