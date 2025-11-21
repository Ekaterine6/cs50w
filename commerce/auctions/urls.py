from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("categories", views.categories, name="categories"),
    path("categories/<str:cat_name>/", views.cat_listings, name="cat_listings"),
    path("listing", views.listing, name="listing"),
    path("listing/<int:listing_id>", views.listing_page, name="listing_page"),
    path("watchlist", views.watchlist, name="watchlist"),
    path("watchlist/add/<int:listing_id>", views.add_watchlist, name="add_watchlist"),
    path("watchlist/remove/<int:listing_id>", views.remove_watchlist, name="remove_watchlist"),
    path("bid/<int:listing_id>", views.placed_bid, name="placed_bid"),
    path("listing/<int:listing_id>/close", views.close_auction, name="close_auction")
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)