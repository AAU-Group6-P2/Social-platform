/*import { login } from "./auth.js";

const form = document.getElementById("login-form");

form.addEventListener("submit", function(event) {
    event.preventDefault(); // forhindrer siden i at reloade

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Kalder login-funktionen fra auth.js
    login(username, password);
});*/

// Hurtig knap til dashboard
const btn = document.getElementById("goDashboardBtn");

btn.addEventListener("click", () => {
    window.location.href = "dashboard.html";
});