import { getClubs, getUserRole } from "../services/clubServices.js";

let allClubs = [];
let role = null;
let dashboardUrl = "/student/index";
let myClubId = null;

async function initClubList() {
    try {
        [role, allClubs] = await Promise.all([
            getUserRole(),
            getClubs()
        ]);
        dashboardUrl = role === "club_owner" ? "/owner/index" : "/student/index";
        myClubId = getMyClubId(allClubs);

        document.getElementById("eventsAndClubsLink")?.addEventListener("click", () => {
            window.location.href = dashboardUrl;
        });

        document.getElementById("backBtn")?.addEventListener("click", () => {
            window.history.length > 1
                ? window.history.back()
                : window.location.href = dashboardUrl;
        });

        renderClubs(allClubs);
    } catch (err) {
        console.error("Failed to load clubs:", err);
    }
}

async function loadClubs() {
    try {
        allClubs = await getClubs();
        myClubId = getMyClubId(allClubs);
        renderClubs(allClubs);
    } catch (err) {
        console.error("Failed to load clubs:", err);
    }
}

//Find the club owners club - Finds the newest created club
function getMyClubId(clubs) {
    if (role !== "club_owner" || !clubs.length) return null;

    const myClub = clubs.reduce((max, club) => club.id > max.id ? club : max, clubs[0]);
    return String(myClub.id);
}

/* Render clubs */
function renderClubs(clubs) {
    const container = document.getElementById("club-list");
    const template = document.getElementById("club-card-template");

    if (!container || !template) return;

    container.innerHTML = ""; 

    if (!clubs || clubs.length === 0) {
        container.innerHTML = "<p>No clubs found</p>";
        return;
    }

    clubs.forEach(club => {
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector(".club-card");
        
        // Set ID and color 
        card.dataset.id = club.id;
        if (club.color) {
            card.style.borderLeft = `5px solid ${club.color}`;
        }

        //Fill out name 
        clone.querySelector(".club-name-placeholder").textContent = club.name;

        //"My Club" Badge - Shows the newest club  made, d adding a badge to it 
        const isMine = role === "club_owner" && myClubId && String(club.id) === myClubId;
        const badge = clone.querySelector(".my-club-badge");
        if (isMine) {
            badge.style.display = "inline"; 
        } else {
            badge.remove(); 
        }

        // 4. Håndter Billede
        const img = clone.querySelector(".club-img");
        if (club.image) {
            img.src = club.image;
            img.style.display = "block"; // Vis billedet
        } else {
            img.remove(); 
        }

        //Adds the club to the page 
        container.appendChild(clone);
    });
}

/* Click club and be directed to the specific club page  */
document.getElementById("club-list")?.addEventListener("click", (e) => {
    const card = e.target.closest(".club-card");
    if (!card) return;

    const clubPageUrl = role === "club_owner" ? "/owner/club" : "/student/club";
    window.location.href = `${clubPageUrl}?id=${card.dataset.id}`;
});

/* Filter of the clubs in categories*/
function filterClubs(category) {
    if (category === "all") {
        renderClubs(allClubs);
    } else {
        const filtered = allClubs.filter(club =>
            (club.category || "").toLowerCase() === category.toLowerCase()
        );
        renderClubs(filtered);
    }

    updateActiveButton(category);
}

//Finds the selected category and sets it to active 
function updateActiveButton(category) {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");

        if (btn.dataset.category === category) {
            btn.classList.add("active");
        }
    });
}

window.filterClubs = filterClubs;

/* Go to the top button */
const toTop = document.getElementById("goToTheTop");
if (toTop) {
    toTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

initClubList();

window.addEventListener("pageshow", (e) => {
    if (e.persisted) loadClubs();
});

//Adds an eventlistener to each category so there can be filtered when a category is clicked
document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        filterClubs(btn.dataset.category);
    });
});
