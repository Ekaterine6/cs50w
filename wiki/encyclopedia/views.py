from django.shortcuts import render
from django.core.files.storage import default_storage

import random 
import markdown2

from . import util


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def entry(request, entry):
    #project demand
    # using the appropriate util function to retrieve the title and the entry text - The view should get the content of the encyclopedia entry by calling 
    # the appropriate util function.
    # retrieve data using get_entry and displaying it 
    text = util.get_entry(entry)
    if text is None:
       return render(request, "encyclopedia/error.html", {"error_mes": "entry does not exist"})
    
    # On each entry’s page, any Markdown content in the entry file should be converted to HTML before being displayed to the user. You may use the python-markdown2
    mark_content = markdown2.markdown(text)

    return render(request, "encyclopedia/entry.html", {
    # required - The title of the page should include the name of the entry.
    # variable entry holds the title of the entry thats why the title itself is the entry
       "entry": mark_content,
       "title": entry 
    })

# Search: Allow the user to type a query into the search box in the sidebar to search for an encyclopedia entry.
def search(request):
    # using post and processing the submitted data
    if request.method == "POST":
        qsearch = request.POST.get("q")
        if not qsearch:
            return render(request, "encyclopedia/error.html", {"error_mes": "please fill out the field"})
        
        qentry = util.get_entry(qsearch)
        if qentry is None:
            return render(request, "encyclopedia/error.html", {"error_mes": "Page not found"})
        return render(request, "encyclopedia/entry.html", {
            "entry": qentry,
            "title": qsearch
        })
    # search results page that displays a list of all encyclopedia entries that have the query as a substring. - project demand 
    entries = util.list_entries
    if entries is util.list_entries:
        return render(request, "encyclopedia/entry.html")


# New Page: Clicking “Create New Page” in the sidebar should take the user to a 
# page where they can create a new encyclopedia entry.
def create_entry(request):
    if request.method == "POST":
        title = request.POST.get("q_title_entry")
        content = request.POST.get("q_entry")

        if not title or not content:
            return render(request, "encyclopedia/error.html", {"error_mes": "form is not filled out."})
        
        # not submitting data until certain tath it doesn't exist .... ealized i made a mistake after submitting 
        # i realized i was still letting the user create a new entry even if it exsited, because
        # i didn't use "is not none" to make sure the entry is really none before submitting.
        if util.get_entry(title) is not None:
            return render(request, "encyclopedia/error.html", {"error_mes": "entry exists."})
  
        util.save_entry(title, content)

        return render(request, "encyclopedia/entry.html", {
            "title": title,
            "entry": content
        })
    return render(request, "encyclopedia/create_entry.html")

# required - On each entry page, the user should be able to click a link to be taken 
# to a page where the user can edit that entry’s Markdown content in a textarea
def edit_entry(request, title):
    entry = util.get_entry(title)

    if request.method == "POST":
        # recieving the edited entry and checking it 
        edited_entry = request.POST.get("entry")
        if edited_entry is None:
            edited_entry = ""

        # saving the edited entry
        util.save_entry(title, edited_entry)
        return render(request, "encyclopedia/entry.html", {
            "title" : title,
            "entry": edited_entry
        })

    return render(request, "encyclopedia/edit_entry.html", {
        "title": title,
        "entry": entry 
    })

# required - Random Page: Clicking “Random Page” in the sidebar should take user to a random encyclopedia entry.
def random_page(request):
    # checking entries and making sure they exist
    entries = util.list_entries()
    if not entries: 
        return render(request, "encyclopedia/error.html", {"error_mes": "no entries."})
    
    random_entry = random.choice(entries) # had to google this, random.choice() from python documentary under random
    
    entry_content = util.get_entry(random_entry)
    return render(request, "encyclopedia/random_page.html", {
        "title": random_entry,
        "entry" : entry_content
    })
