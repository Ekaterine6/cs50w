from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.core.paginator import Paginator
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.contrib.auth.decorators import login_required
import json

from .models import User, Post, Follow


def index(request):
    posts = Post.objects.all().order_by("-timestamp")
    #Django’s Paginator class may be helpful for implementing pagination on the back-end
    paginator = Paginator(posts, 10) #posts should only be displayed 10 on a page

    page_number = request.GET.get("page")
    page_pag = paginator.get_page(page_number)
    return render(request, "network/index.html", {
        "page_pag":page_pag
    })


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
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


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
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
    

# New Post
@login_required
def new_post(request): 
    if request.method == "POST":
        content = request.POST.get("new_txt")

        if content.strip():
            Post.objects.create(
                user=request.user, 
                content=content
            )

        return HttpResponseRedirect(reverse("index"))

    return render(request, "network/new_post.html")



@login_required
def following(request):
    #The “Following” link in the navigation bar should take the user to a page 
    # where they see all posts made by users that the current user follows.
    users = Follow.objects.filter(follower=request.user).values_list("following", flat=True)
    posts = Post.objects.filter(user__in=users).order_by("-timestamp")
    #same pagination code
    paginator = Paginator(posts, 10)

    page_number = request.GET.get("page")
    page_pag = paginator.get_page(page_number)

    return render(request, "network/following.html", {
        "page_pag": page_pag
    })

@login_required
# For any other user who is signed in, this page should also display a “Follow” or “Unfollow” 
# button that will let the current user toggle whether or not they are following this user’s posts. Note that this only applies to any “other” user:
def toggle_follow(request, username):
    if request.method !="PUT":
        return JsonResponse({"error": "required put request"})
    
    target = get_object_or_404(User, username=username)
    #preventing following yourself specification: a user should not be able to follow themselves.
    if request.user == target:
        return JsonResponse({"error": "cant follow yourself"})
    
    follow = Follow.objects.filter(
        follower=request.user,
        following=target
    )
    
    if follow.exists():
        follow.delete()
        is_following = False
    else:
        Follow.objects.create(
            follower=request.user,
            following=target
        )
        is_following = True

    flw_count = Follow.objects.filter(following=target).count()

    return JsonResponse({
        "is_following": is_following,
        "followers_count": flw_count
    })


# Profile Page: Clicking on a username should load that user’s profile page.
def profile(request, username):
    profile_user = get_object_or_404(User, username=username)

    posts = Post.objects.filter(user=profile_user).order_by("-timestamp")
    
    followers_count = Follow.objects.filter(following=profile_user).count()

    following_count = Follow.objects.filter(
        follower=profile_user
    ).count()

    is_following = False
    if request.user.is_authenticated and request.user != profile_user:
        is_following = Follow.objects.filter(
            follower=request.user,
            following=profile_user).exists()
        
    paginator = Paginator(posts, 10)
    page_number = request.GET.get("page")
    page_pag = paginator.get_page(page_number)
        
    return render(request, "network/profile.html", {
        "profile_user": profile_user,
        "page_pag": page_pag,
        "followers_count":followers_count,
        "following_count": following_count,
        "is_following": is_following
    })


#“Like” and “Unlike”
@login_required
def like(request, post_id):
    if request.method != "PUT":
        return JsonResponse({"error": "put request required"})
    
    post = get_object_or_404(Post, id=post_id)
    if request.user in post.likes.all():
        post.likes.remove(request.user)
        liked = False
    else:
        post.likes.add(request.user)
        liked = True

    return JsonResponse({
        "liked": liked,
        "likes_count": post.likes.count()
    })


# Edit Post: click an “Edit” button or link on any of their own posts to edit that post.
@login_required
def editing(request, post_id):
    if request.method != "PUT":
        return JsonResponse({"error": "put request needed."})
    
    post = get_object_or_404(Post, id=post_id)

    if post.user != request.user:
        return JsonResponse({"error": "not allowed"})
    
    data = json.loads(request.body)

    post.content = data.get("content", post.content)
    post.save()
    return JsonResponse({
        "content": post.content
    })


