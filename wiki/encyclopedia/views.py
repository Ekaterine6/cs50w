from django.shortcuts import render
from django.core.files.storage import default_storage


from . import util


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def entry(request, entry):
    # using the appropriate util function to retrieve the title and the entry text - The view should get the content of the encyclopedia entry by calling 
    # the appropriate util function.
    text = util.get_entry(entry)
    if text is None:
       return render(request, "encyclopedia/error.html", {"error_mes": "entry does not exist"})
    return render(request, "encyclopedia/entry.html", {
    # required - The title of the page should include the name of the entry.
       "entry": text,
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
    # search results page that displays a list of all encyclopedia entries that have the query as a substring.
    entries = util.list_entries
    if entries is util.list_entries:
        return render(request, "encyclopedia/entry.html")


# New Page: Clicking “Create New Page” in the sidebar should take the user to a 
# page where they can create a new encyclopedia entry.
def create_entry(request):
    if request.method == "POST":
        title = request.POST.get("q_title_entry")
        content = request.POST.get("q_entry")
        util.save_entry(title, content)
        filename = f"entries/{title}.md"
        if not title or not content:
            return render(request, "encyclopedia/error.html", {"error_mes": "form is not filled out."})

        if default_storage.exists(filename):
            default_storage.delete(filename)
            return render(request, "encyclopedia/error.html", {"error_mes": "entry already exists."})

        default_storage.save(filename)
        return render(request, "encyclopedia/entry.html", {
            "title": title,
            "content": content
        })
    return render(request, "encyclopedia/create_entry.html")


def edit_entry(request, title):
    entry = util.get_entry(title)

    if request.method == "POST":
        changed_entry = request.POST.get("entry", "")

        util.save_entry(title, changed_entry)
        return render(request, "entry", title=title)

    return render(request, "encyclopedia/entry.html", {
        "title": title,
        "entry": entry if entry else "" 
    })