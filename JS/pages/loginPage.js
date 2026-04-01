/*import { login } from "./auth.js";

const form = document.getElementById("login-form");

form.addEventListener("submit", function(event) {
    event.preventDefault(); // forhindrer siden i at reloade

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Kalder login-funktionen fra auth.js
    login(username, password);
});*/

// Hent knapperne
const btnStudent = document.getElementById("goDashboardStudent");
const btnClubOwner = document.getElementById("goDashboardClubOwner");
const btnAdmin = document.getElementById("goDashboardAdmin");

// Redirect til dashboard
btnStudent.addEventListener("click", () => {
    localStorage.setItem("role", "student");
    window.location.href = "dashboard.html";
});

btnClubOwner.addEventListener("click", () => {
    localStorage.setItem("role", "clubOwner");
    window.location.href = "dashboard.html";
});

btnAdmin.addEventListener("click", () => {
    localStorage.setItem("role", "admin");
    window.location.href = "dashboard.html";
});