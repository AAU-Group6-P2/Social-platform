import { getClubs, getEvents, getJoinCount, joinClub } from "./clubServices.js";

function isMyClub(clubId) {
    return sessionStorage.getItem("role") === "club_owner" &&
           sessionStorage.getItem("myClubId") === String(clubId);
}

async function initClubPage() {
    const params = new URLSearchParams(window.location.search);
    const clubId = params.get("id");
    const container = document.getElementById("club-page-content");

    if (!clubId) {
        container.innerHTML = "<p>No club specified.</p>";
        return;
    }

    const clubs = await getClubs();
    const events = await getEvents();

    const club = clubs.find(c => String(c.id) === String(clubId));

    if (!club) {
        container.innerHTML = "<p>Club not found.</p>";
        return;
    }

    const clubEvents = events.filter(
        e => String(e.clubId) === String(clubId) && e.isPublished === true
    );
    const firstEvent = clubEvents[0] || null;

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

    const editButton = isMyClub(clubId)
        ? `<button id="edit-club-btn" class="role-button primary-button">Edit Club</button>`
        : "";

    container.innerHTML = `
        <div class="content-area">
            <div class="club-page-topbar">
                <div style="display:flex; flex-direction:column; align-items:flex-start; gap:8px;">
                    <h1>Events & clubs - Informationssite - ${club.name}</h1>
                    <button id="close-event-page" class="role-button">Go Back</button>
                </div>
                ${editButton}
            </div>

            <!-- Edit form (hidden by default) -->
            <div id="edit-club-form-box" class="hidden">
                <form id="edit-club-form" class="myclub-form">
                    <div class="myclub-section">
                        <h3>Event Info</h3>
                        <label>Date
                            <input type="date" name="date" value="${firstEvent?.date || ''}">
                        </label>
                        <label>Time
                            <input type="time" name="time" value="${firstEvent?.time || ''}">
                        </label>
                        <label>Place
                            <input type="text" name="location" placeholder="Location" value="${firstEvent?.location || ''}">
                        </label>
                    </div>
                    <div class="myclub-section">
                        <h3>Contact Info</h3>
                        <label>Email
                            <input type="email" name="contactEmail" placeholder="Contact email" value="${club.contactEmail || ''}">
                        </label>
                        <label>Phone
                            <input type="text" name="phone" placeholder="Phone number" value="${club.phone || ''}">
                        </label>
                    </div>
                    <p id="edit-club-status" aria-live="polite"></p>
                    <div class="myclub-actions">
                        <button type="button" id="cancel-edit-btn" class="role-button">Cancel</button>
                        <button type="submit" class="role-button primary-button">Save changes</button>
                    </div>
                </form>
            </div>

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
                        <p>${firstEvent?.date || 'Information follows'}</p>
                        <h3>Time:</h3>
                        <p>${firstEvent?.time || 'Information follows'}</p>
                        <h3>Place:</h3>
                        <p>${firstEvent?.location || 'Information follows'}</p>
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

    // Join button
    const count = await getJoinCount(clubId);
    const joinBtn = container.querySelector(".join-btn");
    joinBtn.textContent = `Join us (${count.joined} joined)`;
    joinBtn.addEventListener("click", async () => {
        const result = await joinClub(clubId);
        joinBtn.textContent = `Join us (${result.joined} joined)`;
    });

    // Go Back
    container.querySelector("#close-event-page").addEventListener("click", () => {
        window.history.back();
    });

    // Edit Club button
    const editBtn = container.querySelector("#edit-club-btn");
    const editFormBox = container.querySelector("#edit-club-form-box");
    const editForm = container.querySelector("#edit-club-form");
    const cancelBtn = container.querySelector("#cancel-edit-btn");
    const editStatus = container.querySelector("#edit-club-status");

    if (editBtn) {
        editBtn.addEventListener("click", () => {
            editFormBox.classList.remove("hidden");
            editBtn.classList.add("hidden");
        });

        cancelBtn.addEventListener("click", () => {
            editFormBox.classList.add("hidden");
            editBtn.classList.remove("hidden");
        });

        editForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const data = new FormData(editForm);
            editStatus.textContent = "Saving...";

            try {
                await fetch(`/clubs/${clubId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contactEmail: data.get("contactEmail"),
                        phone: data.get("phone")
                    })
                });

                if (firstEvent) {
                    await fetch(`/events/${firstEvent.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            date: data.get("date"),
                            time: data.get("time"),
                            location: data.get("location")
                        })
                    });
                }

                editStatus.textContent = "Saved!";
                setTimeout(() => {
                    editFormBox.classList.add("hidden");
                    editBtn.classList.remove("hidden");
                    editStatus.textContent = "";
                }, 1500);
            } catch (err) {
                editStatus.textContent = "Failed to save. Try again.";
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", initClubPage);
