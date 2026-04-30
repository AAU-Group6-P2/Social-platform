// Hent rolle fra sessionStorage
// Import RBAC
import { hasPermission } from "../core/rbac.js"; //Henter funktionen hasPermission fra rbac.js
import { getRole } from "../core/auth.js";

/*Importer data fra database */
// import { supabase } from '../../Supabase.js'

/*Import the club list */
    import { getClubs } from "./clubServices.js";
    import { getEvents } from "./clubServices.js";
    import { createEvent } from "./clubServices.js";
    import { getJoinCount } from "./clubServices.js";
    import { joinClub } from "./clubServices.js";

    
// Club owner buttton - Button to change between roles  
const btnClubOwner = document.getElementById("goDashboardClubOwner");  

// Redirect til dashboard og gem rolle i sessionStorage
// btnClubOwner.addEventListener("click", () => {
//     sessionStorage.setItem("role", "club_owner"); // match auth.js naming
//     window.location.href = "index.html";

// });

//Student button - Button to change between roles 
const btnStudent = document.getElementById("goDashboardStudent");

// btnStudent.addEventListener("click", () => {
//     sessionStorage.setItem("role", "student"); //Gemmer rollen "student" i browserens sessionStorage
//     window.location.href = "index.html";
// });


//Udkommenteret da vi lige nu ikke ændrer styling baseret på rollen ved at sætte body's class.
// Styling baseret på role
// function applyRoleClass() { //tilføjer body.classList.add("club_owner") eller body.classList.add("admin")
//     const role = getRole();
//     document.body.classList.remove("student", "club_owner", "admin"); //Sikrer at der ikke ligger gemte roller tilbage
//     if (role){
//         document.body.classList.add(role); //Tilføj den nuværende brugers rolle som en CSS-klasse på hele siden
//     } 
// }

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

const LOCAL_EVENTS_KEY = "mapout_local_events";

function readLocalEvents() {
    const savedEvents = localStorage.getItem(LOCAL_EVENTS_KEY);
    if (!savedEvents) {
        return [];
    }
    try {
        return JSON.parse(savedEvents);
    } catch {
        return [];
    }
}

function createLocalEvent(eventData) {
    const existingEvents = readLocalEvents();
    const newEvent = {
        id: Date.now(),
        ...eventData
    };
    existingEvents.push(newEvent);
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(existingEvents));
    return newEvent;
}

function initDashboard() {
    //applyRoleClass();       // Visuelle ændringer baseret på rolle. <body>'s class sættes til at være en af rollerne
    applyPermissions();     // Fjern knapper som brugeren ikke må se

    // Show My Club section for club owners
    if (hasPermission("my_club")) {
        const myClubSection = document.getElementById("my-club-section");
        const myClubCardContainer = document.getElementById("my-club-card-container");

        if (myClubSection && myClubCardContainer) {
            // stays hidden until Club List is opened

            getClubs().then(clubs => {
                // TODO: replace this lookup with owner-club association from backend
                const myClub = clubs.find(c => c.name.toLowerCase().includes("chess")) || clubs[0];
                if (!myClub) return;

                // Store so clubPage.js knows which club this owner manages
                sessionStorage.setItem("myClubId", String(myClub.id));

                myClubCardContainer.innerHTML = `
                    <div class="club-card" data-id="${myClub.id}" style="cursor:pointer">
                        <h3>${myClub.name}</h3>
                        <img src="${myClub.image}" alt="${myClub.name}" class="club-img"/>
                    </div>
                `;

                myClubCardContainer.querySelector(".club-card").addEventListener("click", () => {
                    window.location.href = `club.html?id=${myClub.id}`;
                });
            });
        }
    }

    //Redirect to log in page
    const logOut = document.getElementById("logOut");
    if (logOut) {
        logOut.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    }

    /*oppening and closing of the application for club or events box */
    const apply_create_club_or_event = document.getElementById("createClubOrEvent");
    const apply_create_club_or_event_box = document.getElementById("create-club-or-event_box");
    const createEventButton = document.getElementById("createEventButton");
    const eventPageBox = document.getElementById("event-page-box");
    const dashboardHome = document.getElementById("dashboard-home");

    if (apply_create_club_or_event) {
        apply_create_club_or_event.addEventListener("click", async () => {

            // Hent HTML fra separat fil
            const response = await fetch("components/application_club-event_form.html");
            const html = await response.text();

            // Indsæt HTML i container
            apply_create_club_or_event_box.innerHTML = html;

            // Vis popup
            apply_create_club_or_event_box.classList.remove("hidden");
            const eventCheckbox = document.getElementById('checkBoxEvent');
            const filterBox = document.getElementById('event-filter-box');
            if (eventCheckbox && filterBox) {
                eventCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    filterBox.style.display = 'block'; // Vis boksen hvis der er flueben
                } else {
                    filterBox.style.display = 'none';  // Skjul den hvis fluebenet fjernes
                }
            });
        }

            // Luk-knap (skal bindes EFTER HTML er indsat)
            const closeBtn = document.getElementById("close-page");
            if (closeBtn) {
                closeBtn.addEventListener("click", () => {
                    apply_create_club_or_event_box.classList.add("hidden");
                    apply_create_club_or_event_box.innerHTML = "";
                });
            }
        });
    }

    const calendarContainer = document.querySelector(".calendarcontainer");
    const filterBar = document.querySelector(".filter");
    const dateFilterRow = document.getElementById("date-filter-row");

    function hideCalendarUI() {
        calendarContainer?.classList.add("hidden");
        filterBar?.classList.add("hidden");
        dateFilterRow?.classList.add("hidden");
    }

    function showCalendarUI() {
        calendarContainer?.classList.remove("hidden");
        filterBar?.classList.remove("hidden");
        dateFilterRow?.classList.remove("hidden");
    }

    if (createEventButton && eventPageBox) {
        createEventButton.addEventListener("click", async () => {
            if (!hasPermission("create_event")) return;

            const response = await fetch("components/event_template.html");
            const html = await response.text();

            eventPageBox.innerHTML = html;
            eventPageBox.classList.remove("hidden");
            dashboardHome?.classList.add("hidden");
            hideCalendarUI();

            const closeEventBtn = eventPageBox.querySelector("#close-event-template");
            const eventForm = eventPageBox.querySelector("#event-template-form");
            const statusMessage = eventPageBox.querySelector("#event-form-status");

            if (closeEventBtn) {
                closeEventBtn.addEventListener("click", () => {
                    eventPageBox.classList.add("hidden");
                    eventPageBox.innerHTML = "";
                    dashboardHome?.classList.remove("hidden");
                    showCalendarUI();
                });
            }

            if (eventForm) {
                eventForm.addEventListener("submit", async submitEvent => {
                    submitEvent.preventDefault();

                    const formData = new FormData(eventForm);
                    const submitButton = eventForm.querySelector('button[type="submit"]');
                    const payload = {
                        name: formData.get("name")?.toString().trim(),
                        date: formData.get("date")?.toString().trim(),
                        timeStart: formData.get("timeStart")?.toString().trim(),
                        timeEnd: formData.get("timeEnd")?.toString().trim(),
                        clubId: formData.get("clubId") ? Number(formData.get("clubId")) : null,
                        location: formData.get("location")?.toString().trim(),
                        description: formData.get("description")?.toString().trim(),
                        practicalInformation: formData.get("practicalInformation")?.toString().trim(),
                        isPublished: true
                    };

                    if (statusMessage) {
                        statusMessage.textContent = "Saving event...";
                    }

                    try {
                        if (submitButton) {
                            submitButton.disabled = true;
                        }

                        createLocalEvent(payload);
                        await createEvent(payload);

                        if (statusMessage) {
                            statusMessage.textContent = "Event saved.";
                        }

                        eventForm.reset();
                    } catch (error) {
                        if (statusMessage) {
                            statusMessage.textContent = error.message;
                        }
                    } finally {
                        if (submitButton) {
                            submitButton.disabled = false;
                        }
                    }
                });
            }
        });
    }

    /*Import the club list */
    let clubsLoaded = false; //makes sure we do not load double

    /*Load clubs */
    window.loadClubs = async function loadClubs(){
        if(clubsLoaded) return;

        const clubs = await getClubs();

        const container = document.getElementById("club-list");
        if (!container) {
            console.error("club-list not found in DOM");
            return;
        }

        // Filter out the owner's club only for club owners
        const myClubId = sessionStorage.getItem("myClubId");
        const visibleClubs = (hasPermission("my_club") && myClubId)
            ? clubs.filter(c => String(c.id) !== myClubId)
            : clubs;

        //Converts the JS data from the database into HTML cards
        container.innerHTML = visibleClubs.map(clubs => `
            <div class="club-card" data-id="${clubs.id}">
                <h3>${clubs.name}</h3>
                <img src="${clubs.image}" alt="${clubs.name}" class="club-img"/>
            </div>
        `).join("");

        /*Opens club page when user clicks on a club */
        container.addEventListener("click", (e) => {
            const card = e.target.closest(".club-card");
            if (!card) return;

            const clubId = card.dataset.id;
            if (!clubId) return;

            window.location.href = `club.html?id=${clubId}`;
        });
    }

    /*Import the event data*/
    async function openClubPage(clubId){
        const clubs = await getClubs();
        const events = await getEvents();

        const club = clubs.find(c => String(c.id) === String(clubId));

        const container = document.getElementById("club-list-box");

        if (!club) {
            container.innerHTML = "<p>Club not found</p>";
            return;
        }

        const clubEvents = events.filter(
            e =>  String(e.clubId) === String(clubId) && e.isPublished === true
        );

        //event HTML - 161
        const eventsHTML = clubEvents.length > 0
            ? clubEvents.map(event => `
                <div class="event-card">
                    <h3>${event.title || "Event"}</h3>
                    <p><strong>Date:</strong> ${event.date}</p>
                    <p><strong>Time:</strong> ${event.time}</p>
                    <p><strong>Place:</strong> ${event.location}</p>
                </div>
            `).join("")
            : "<p>No events available yet</p>";

      container.innerHTML = `
        <div class="content-area">
            <button id="close-event-page" class="role-button" style="margin-bottom:16px;">Go Back</button>
            <h1>Events & clubs - Informationssite - ${club.name}</h1>

            <div class="white-box">
                <div class="hero">
                    <img src="${club.image}" alt="${club.name}">
                </div>

                <div class="description">
                    <p><strong>Join us!</strong><br>
                    ${club.description}</p>
                </div>

                <div class="info-section">
                    <div class="info-card">
                        <h3>Date:</h3>
                        <p>${clubEvents.length > 0 ? clubEvents[0].date : 'Information follows'}</p>
                        <h3>Time:</h3>
                        <p>${clubEvents.length > 0 ? clubEvents[0].time : 'Information follows'}</p>
                        <h3>Place:</h3>
                        <p>${clubEvents.length > 0 ? clubEvents[0].location : 'Information follows'}</p>
                    </div>

                    <div class="info-card">
                        <h3>Current members:</h3>
                        <p>${club.memberCount || 'TBA'}</p>
                        <h3>Contact info:</h3>
                        <p>${club.contactEmail || 'No email provided'}</p>
                        <p>${club.phone || ''}</p>
                    </div>

                    <button class="join-btn">Join us</button>
                </div>

                <div class="event-section">
                         <h2>Events</h2>
                        ${eventsHTML}
                    </div>

            </div>
        </div>
    `;

        //function to import club member count and join a club
        const count = await getJoinCount(clubId);

        const joinBtn = document.querySelector(".join-btn");
        joinBtn.textContent = `Join us (${count.joined} joined)`;

        joinBtn.addEventListener("click", async () => {
            const result = await joinClub(clubId);
            joinBtn.textContent = `Join us (${result.joined} joined)`;
        });
       

        // close the club page
        const closeClubPage = container.querySelector("#close-event-page");

        if (closeClubPage) {
            closeClubPage.addEventListener("click", async () => {
                const response = await fetch("components/club_list.html");
                const html = await response.text();

                container.innerHTML = html;
                await loadClubs();
            });
        }
    }
}

    /*opening and closing of the club list */
    
    const clubListLink = document.getElementById("clubListLink");
    
    if(clubListLink){
        clubListLink.addEventListener("click", async () => {

        const clubListBox = document.getElementById("club-list-box"); // The box where the clubs will be shown
        const myClubSection = document.getElementById("my-club-section");

            // Hent HTML fra seperat fil
            const response = await fetch("components/club_list.html");
            const html = await response.text();

            //Indsæt HTML i container
            clubListBox.innerHTML = html;

            //Function from clubServucSes.js that loads the clubs in
            await loadClubs();

            //Vis box
            clubListBox.classList.remove("hidden");

            // Inject My Club section at the top of the club list overlay
            const myClubId = sessionStorage.getItem("myClubId");
            if (myClubId && hasPermission("my_club")) {
                getClubs().then(clubs => {
                    const myClub = clubs.find(c => String(c.id) === myClubId);
                    if (!myClub) return;

                    const myClubHTML = `
                        <div id="my-club-in-list">
                            <h2>My Club</h2>
                            <div class="club-card" data-id="${myClub.id}" style="cursor:pointer; margin-bottom: 20px;">
                                <h3>${myClub.name}</h3>
                                <img src="${myClub.image}" alt="${myClub.name}" class="club-img"/>
                            </div>
                        </div>
                    `;

                    const closeBtn = clubListBox.querySelector("#close-club-list");
                    if (closeBtn) closeBtn.insertAdjacentHTML("afterend", myClubHTML);

                    clubListBox.querySelector(`[data-id="${myClub.id}"]`)?.addEventListener("click", () => {
                        window.location.href = `club.html?id=${myClub.id}`;
                    });
                });
            }

            /*Close box when span is clicked */
            document.addEventListener("click", (e) => {
                if (e.target.closest("#close-club-list")) {
                    const clubListBox = document.getElementById("club-list-box");
                    const clubContent = document.getElementById("club-content");
                    const myClubSection = document.getElementById("my-club-section");

                    if (clubListBox) { //Hides the box
                        clubListBox.classList.add("hidden");
                    }

                    if (clubContent) { //removes all html inside the container
                        clubContent.innerHTML = "";
                    }

                    if (myClubSection) myClubSection.classList.add("hidden");
                }
            });
        });

    }

document.addEventListener("DOMContentLoaded", initDashboard); //DOMContentLoaded betyder: “Kør først, når hele HTML’en er indlæst.”

