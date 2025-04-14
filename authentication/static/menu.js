document.addEventListener("DOMContentLoaded", function () {
    // Create the menu HTML
    const menuHTML = `
        <div id="main_menu" class="menu">
            <a href="javascript:void(0)" class="closebtn" id="closeBtn">x</a>
            <a href="/index.html">მთავარი</a>
            <a href="/templates/attendance.html">აღრიცხვა</a>
            <a href="/templates/forms.html">ჯგუფესი შექმნა</a>
            <a href="/templates/add_students.html">სტუდენტების დამატება</a>
            <a href="/templates/lists.html">განრიგი</a>
            <a href="/templates/students.html">ინფორმაცია</a>
            <a href="/templates/settings.html">Settings</a>
        </div>
        <div id="menubtn">
            <button class="openbtn" id="openBtn">MENU</button>
        </div>
    `;

    // Inject the menu into the page
    const menuContainer = document.getElementById("menu-container");
    if (menuContainer) {
        menuContainer.innerHTML = menuHTML;
        attachMenuEvents(); // Attach event listeners
    } else {
        console.error("Error: #menu-container not found!");
    }
});

function attachMenuEvents() {
    const mainMenu = document.getElementById("main_menu");
    const menuBtnContainer = document.getElementById("menubtn");
    const openBtn = document.getElementById("openBtn");
    const closeBtn = document.getElementById("closeBtn");

    if (!mainMenu || !menuBtnContainer || !openBtn || !closeBtn) {
        console.error("Error: Menu elements not found!");
        return;
    }

    openBtn.addEventListener("click", function () {
        mainMenu.style.width = "250px";
        menuBtnContainer.style.marginLeft = "250px";
    });

    closeBtn.addEventListener("click", function () {
        mainMenu.style.width = "0";
        menuBtnContainer.style.marginLeft = "0";
    });

    console.log("✅ Menu loaded and event listeners attached!");
}
