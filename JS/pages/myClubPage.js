import { getClubs, getEvents } from "./clubServices.js";

async function initMyClubPage() {
    const container = document.getElementById("myclub-content");

    const clubs = await getClubs();
    const events = await getEvents();

    // Find the Chess Club, fall back to first club if not found
    const club = clubs.find(c => c.name.toLowerCase().includes("chess")) || clubs[0];

    if (!club) {
        container.innerHTML = "<p>No club found.</p>";
        return;
    }

    const clubEvents = events.filter(
        e => String(e.clubId) === String(club.id) && e.isPublished === true
    );
    const firstEvent = clubEvents[0] || null;

    container.innerHTML = `
        <div class="myclub-shell">
            <div class="myclub-header">
                <img src="${club.image}" alt="${club.name}" class="myclub-hero-img">
                <h2>${club.name}</h2>
            </div>

            <form id="myclub-form" class="myclub-form">
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

                <p id="myclub-status" aria-live="polite"></p>

                <div class="myclub-actions">
                    <button type="submit" class="role-button primary-button">Save changes</button>
                </div>
            </form>
        </div>
    `;

    const form = document.getElementById("myclub-form");
    const status = document.getElementById("myclub-status");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = new FormData(form);
        status.textContent = "Saving...";

        try {
            // Update club contact info
            await fetch(`/clubs/${club.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contactEmail: data.get("contactEmail"),
                    phone: data.get("phone")
                })
            });

            // Update event date/time/location if an event exists
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

            status.textContent = "Saved!";
        } catch (err) {
            status.textContent = "Failed to save. Try again.";
        }
    });
}

document.addEventListener("DOMContentLoaded", initMyClubPage);
