from django.shortcuts import render

from . import util


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def entry(request, entry):
    # using the appropriate util function to retrieve the title and the entry text
    text = util.get_entry(entry)
    if text is None: # checking if the entry exists if not returning an error
       return render(request, "encyclopedia/error.html")
    return render(request, "encyclopedia/entry.html", {
    # The title of the page should include the name of the entry.
       "entry": text,
       "title": entry 
    })

def search(request):
    # using post and processing the submitted data
    if request.method == "POST":
        qsearch = request.POST.get("q") # making sure the q field is filled out 
        if not qsearch:
            return render(request, "encyclopedia/error.html")
    
        qentry = util.get_entry(qsearch)
        if qentry is None:
            return render(request, "encyclopedia/error.html")
        return render(request, "encyclopedia/entry.html", {
            "entry": qentry,
            "title": qsearch
        })
    # search results page that displays a list of all encyclopedia entries that have the query as a substring.
    entries = util.list_entries
    if entries is util.list_entries:
        return render(request, "encyclopedia/entry.html")


    