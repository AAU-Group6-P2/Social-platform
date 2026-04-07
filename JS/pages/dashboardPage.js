// Hent rolle fra sessionStorage


// Import RBAC
import { hasPermission } from "../core/rbac.js"; //Henter funktionen hasPermission fra rbac.js
import { getRole } from "../core/auth.js";
 
// Styling baseret på role
function applyRoleClass() { //tilføjer body.classList.add("club_owner") eller body.classList.add("admin")
    const role = getRole();
    document.body.classList.remove("user", "club_owner", "admin"); //Sikrer at der ikke ligger gemte roller tilbage
    if (role){
        document.body.classList.add(role); //Tilføj den nuværende brugers rolle som en CSS-klasse på hele siden
    } 
}

// Permission-baseret UI
function applyPermissions() {
    const elements = document.querySelectorAll("[data-permission]"); //finder alle HTML-elementer som har attributten data-permission. (en knap kan have det som attribut: <button data-permission="create_event">Create Event</button>)

    elements.forEach(element => {
        const permission = element.dataset.permission; //permission-værdien hentes(dataset læser data-atributter). I eksemplet med knappen læses der "create_event"

        if (!hasPermission(permission)) { //tager en permission-string det kunne være "create_event" og returnerer true eller false
            element.remove(); //Hvis brugeren ikke har permission → fjernes elementet modsat hvis de har forbliver den synlig
        }
    });
}

function initDashboard() {
    applyRoleClass();       // Visuelle ændringer baseret på rolle. <body>'s class sættes til at være en af rollerne
    applyPermissions();     // Fjern knapper som brugeren ikke må se

    const role = getRole(); // læser fra sessionStorage
    const roleText = document.getElementById("roleText");
    roleText.textContent = role
    ? `You are logged in as ${role}`
    : `No role selected`

    /* Redirect til index.html(login page) og logger brugeren ud */
    const logOut = document.getElementById("logOut"); //hent tilbagekanppen
        logOut.addEventListener("click", () => { //lyt efter om der bliver klikket
            window.location.href = "index.html";
        });
    
}

document.addEventListener("DOMContentLoaded", initDashboard); //DOMContentLoaded betyder: “Kør først, når hele HTML’en er indlæst.”