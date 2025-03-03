from django.shortcuts import render

from . import util


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def entry(request, entry):
    text = util.get_entry(entry)
    if text is None: 
       return render(request, "encyclopedia/error.html")
    return render(request, "encyclopedia/entry.html", {
       "entry": text,
       "title": entry 
    })
