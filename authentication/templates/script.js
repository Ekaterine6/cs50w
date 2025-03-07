document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("Form");

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        //getting the data from the form
        const formData = new FormData(form);
        const name = formData.get("name");
        const surname = formData.get("surname");
        const email = formData.get("email");
        const number = formData.get("phone");

        console.log("სტუდენტი დამატებულია");
        console.log("Name:", name);
        console.log("Surname:", surname);
        console.log("Email", email);
        console.log("phone", phone);

        if (name && surname && email && number) {
            fetch('submit-form', {
                method: 'POST',
                body:JSON.stringify({
                    name: name,
                    surname: surname,
                    email: email,
                    phone: phone
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.text())
            .then(data => {
                console.log(data);
                alert("სტუდენტი დამატებულია");
            })
            .catch((error) => {
                console.error('Error:', error)
            });
        }
        else {
            alert("გთხოვთ სრულად შეავსეთ ფორმა!");
        }
    });
});