from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib import messages
from decimal import Decimal

from .models import Listing, User, Bid


def index(request):
    listings = Listing.objects.filter(is_active=True).order_by('-id')
     
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


@login_required
def placed_bid(request, listing_id):
    listing = get_object_or_404(Listing, id=listing_id)

    if request.method == "POST":
        bid_amount = request.POST.get("bid_amount")

        try:
            bid_amount = Decimal(bid_amount)
        except:
            return render(request, "auctions/listing_page.html", {
                "listing" : listing,
                "error": "Enter a valid bid number!"
            })
        
        highest_bid_yet = listing.bids.order_by('-amount').first()
        min_bid = listing.bid if highest_bid_yet is None else highest_bid_yet.amount

        if bid_amount <= min_bid:
            return render(request, "auctions/listing_page.html", {
                "listing": listing,
                "error": f"the bid you placed must be higher than the current bid - {min_bid}"
            })
        
        Bid.objects.create(
            user=request.user, listing=listing, amount=bid_amount)

        return redirect("listing_page", listing_id=listing.id)


@login_required
def listing(request):
    if request.method == "POST":
        title = request.POST.get("title")
        description = request.POST.get("description")
        bid = request.POST.get("bid")
        tag_category = request.POST.get("tag_category")
        picture = request.FILES.get("picture")

        # saving the listing info to database
        Listing.objects.create(
            title=title,
            description=description,
            bid=bid,
            tag_category=tag_category,
            picture=picture,
            user=request.user if request.user.is_authenticated else None
        )
        return redirect("index")
    return render(request, "auctions/listing.html")


def listing_page(request, listing_id):
    listing = get_object_or_404(Listing, id=listing_id)
    return render(request, "auctions/listing_page.html", {
        "listing": listing
    })

@login_required
def watchlist(request):
    listings = request.user.watchlist.all()
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


# the user should have the ability to “close” the auction
@login_required
def close_auction(request, listing_id):
    listing = get_object_or_404(Listing, id=listing_id)

    if request.user != listing.user:
        return render(request, "auctions/listing_page.html", {
            "listing": listing,
            "error" : f"Don't have the rights to close the auction"
    })

    if request.method == "POST":
        highest_bid = listing.bids.order_by('-amount').first()
        if highest_bid:
            listing.winner = highest_bid.user

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
