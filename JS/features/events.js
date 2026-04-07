const container = document.getElementById("admin-panel");
export function renderCreateEventForm() {
     container.innerHTML = `
        <h2>Create Event</h2>
        <form id="event-form">
            <input type="text" id="title" placeholder="Title" required />
            <input type="date" id="date" required />
            <input type="text" id="location" placeholder="Location" required />
            <textarea id="description" placeholder="Description" required></textarea>
            <button type="submit">Create Event</button>
        </form>
    `;

     document
        .getElementById("event-form")
        .addEventListener("submit", handleCreateEvent);
}

export function validateEventForm(data) {
    return (
        data.title &&
        data.date &&
        data.location &&
        data.description
    );
}


