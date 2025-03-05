document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("Form");

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        //getting the data from the form
        const formData = new FormData(form);
        const name = formData.get("name");
        const surname = formData.get("surname");
        const email = formData.get("email");
        const number = formData.get("number");

        console.log("სტუდენტი დამატებულია");
        console.log("Name:", name);
        console.log("Surname:", surname);
        console.log("Email", email);
        console.log("Number", number);

        if (name && surname && email && number) {
            success.style.display = "block";
        }
        else {
            alert("გთხოვთ სრულად შეავსეთ ფორმა!");
        }
    });
});